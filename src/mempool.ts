import { Block, TARGET } from './block'
import { Chain } from './chain'
import { logger } from './logger'
import { AnnotatedError, BlockObject } from './message'
import { db, ObjectId, objectManager } from './object'
import { Transaction} from './transaction'
import { UTXOSet } from './utxo'
import { workerData, Worker, WorkerOptions } from 'worker_threads'
import { chainManager } from './chain'
import { TransactionObjectType, BlockObjectType } from './message'
import { network } from './network'
import * as ed from '@noble/ed25519';
import { canonicalize } from 'json-canonicalize'
import { hash } from './crypto/hash'
import { delay } from './promise'

function importWorker(path: string, options?: WorkerOptions) {
  const resolvedPath = require.resolve(path);
  return new Worker(resolvedPath, {
    ...options,
    execArgv: /\.ts$/.test(resolvedPath) ? ["--require", "ts-node/register"] : undefined,
  });
}

class MemPool {
  txs: Transaction[] = []
  state: UTXOSet | undefined
  worker : Worker | undefined

  sk = 'b45716e09d24ba10dfeb0c4bf139571246434a741caff6952b16181361134865'
  pk = `ff0d426d265974cb361731ec0bc8d17be1094831f9efa13ced2b06a15e63911f`

  async init() {
    await this.load()

    console.log("Do I get here")

    //Initialize worker and start mining
    this.startMiner()
  
    console.log("Execution in main thread");
    logger.debug('Mempool initialized')
  }

  newBlock(coinbase: TransactionObjectType){
    const coin = hash(canonicalize(coinbase))
    const theBlock : BlockObjectType = {
      T: TARGET,
      created: Math.floor(new Date().getTime() / 1000),
      miner: 'VB :)',
      nonce: '0000000000000000000000000000000000000000000000000000000000000000',
      note: 'Just over here mining',
      previd: chainManager.longestChainTip?.blockid!,
      txids: [coin].concat(mempool.getTxIds()),
      type: 'block',
      studentids: ['vbarnard']
    }
    return theBlock
  }

  async startMiner(){
    let coinbase : TransactionObjectType = {
      height : chainManager.longestChainHeight + 1,
      outputs : [{
          pubkey: this.pk,
          value: 50000000000
      }],
      type: "transaction"
    } 
    const weirdBlock = this.newBlock(coinbase)
    const theBlock = (await Block.fromNetworkObject(weirdBlock)).toNetworkObject()
    this.worker = importWorker("./worker.ts", {workerData: {newBlock: theBlock}})
  
    //When block is mined, broadcast it
    this.worker.on("message", result => {
      for (const peer of network.peers){
        console.log(`Mined block ${result}`)
        peer.sendObject(result)
      }   

    });
  
    //Check for error
    this.worker.on("error", error => {
        console.log(error);
    });
  
    //Check for completion/error
    this.worker.on("exit", exitCode => {
        console.log(`It exited with code ${exitCode}`);
        this.startMiner()
    })
  }

  getTxIds(): ObjectId[] {
    const txids = this.txs.map(tx => tx.txid)

    logger.debug(`Mempool txids: ${txids}`)

    return txids
  }
  async fromTxIds(txids: ObjectId[]) {
    this.txs = []

    for (const txid of txids) {
      this.txs.push(Transaction.fromNetworkObject(await objectManager.get(txid)))
    }
  }
  async save() {
    if (this.state === undefined) {
      throw new AnnotatedError('INTERNAL_ERROR', 'Could not save undefined state of mempool to cache.')
    }
    await db.put('mempool:txids', this.getTxIds())
    await db.put('mempool:state', Array.from(this.state.outpoints))
  }
  async load() {
    try {
      const txids = await db.get('mempool:txids')
      logger.debug(`Retrieved cached mempool: ${txids}.`)
      this.fromTxIds(txids)
    }
    catch {
      this.txs = []
      this.state = new UTXOSet(new Set())
      await this.save()
      // start with an empty mempool of no transactions
    }
    try {
      logger.debug(`Loading mempool state from cache`)
      const outpoints = await db.get('mempool:state')
      logger.debug(`Outpoints loaded from cache: ${outpoints}`)
      this.state = new UTXOSet(new Set<string>(outpoints))
    }
    catch {
      // start with an empty state
      this.state = new UTXOSet(new Set())
    }
  }
  async onTransactionArrival(tx: Transaction): Promise<boolean> {
    try {
      if (tx.isCoinbase()) {
        throw new Error('coinbase cannot be added to mempool')
      }
      await this.state?.apply(tx)
    }
    catch (e: any) {
      // failed to apply transaction to mempool, ignore it
      logger.debug(`Failed to add transaction ${tx.txid} to mempool: ${e.message}.`)
      return false
    }
    logger.debug(`Added transaction ${tx.txid} to mempool`)
    this.txs.push(tx)
    await this.save()
    return true
  }
  async reorg(lca: Block, shortFork: Chain, longFork: Chain) {
    logger.info('Reorganizing mempool due to longer chain adoption.')

    const oldMempoolTxs: Transaction[] = this.txs
    let orphanedTxs: Transaction[] = []

    for (const block of shortFork.blocks) {
      orphanedTxs = orphanedTxs.concat(await block.getTxs())
    }
    logger.info(`Old mempool had ${oldMempoolTxs.length} transaction(s): ${oldMempoolTxs}`)
    logger.info(`${orphanedTxs.length} transaction(s) in ${shortFork.blocks.length} block(s) were orphaned: ${orphanedTxs}`)
    orphanedTxs = orphanedTxs.concat(oldMempoolTxs)

    this.txs = []

    const tip = longFork.blocks[longFork.blocks.length - 1]
    if (tip.stateAfter === undefined) {
      throw new Error(`Attempted a mempool reorg with tip ${tip.blockid} for which no state has been calculted.`)
    }
    this.state = tip.stateAfter

    let successes = 0
    for (const tx of orphanedTxs) {
      const success = await this.onTransactionArrival(tx)

      if (success) {
        ++successes
      }
    }

    //await this.save()

    //Worker logic
    console.log("TERMINATE")
    this.worker?.terminate()
    this.startMiner()

    logger.info(`Re-applied ${successes} transaction(s) to mempool.`)
    logger.info(`${successes - orphanedTxs.length} transactions were abandoned.`)
    logger.info(`Mempool reorg completed.`)
    await this.save()
  }
}

export const mempool = new MemPool()
