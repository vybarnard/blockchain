import { BlockObject, BlockObjectType,
    TransactionObject, ObjectType, AnnotatedError, ErrorChoice } from './message'
import { hash } from './crypto/hash'
import { canonicalize } from 'json-canonicalize'
import { Peer } from './peer'
import { objectManager, ObjectId, db } from './object'
import util from 'util'
import { UTXOSet } from './utxo'
import { logger } from './logger'
import { Transaction } from './transaction'
import { chainManager } from './chain'
import { Deferred } from './promise'
import { BlockManager, TARGET } from './block'
import { mempool } from './mempool'
import { getUnpackedSettings } from 'http2'
import { delay } from './promise'
import { Block } from './block'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { parentPort } from 'worker_threads'

export class Miner {

    studentids: string[]
    newBlock: Block
    constructor(studentid:string){
        this.studentids = [studentid]
        let txs = mempool.getTxIds()
        let currtime = Math.floor(new Date().getTime() / 1000)
        this.newBlock = new Block(
            null,
            txs,
            '0000000000000000000000000000000000000000000000000000000000000000',
            TARGET,
            currtime,
            'Vanessa :)',
            'Block mined for hw6!',
            this.studentids,
        )
    }

    syncWriteFile(data: any) {
        writeFileSync(join(__dirname, 'mineLog.txt'), data, {
            flag: 'a+'
        })
    }

    async mine(chainTip: Block){
        //let chainTip : Block = await Block.makeGenesis()
        await chainManager.init()
        while(true){
            //let chaintip = chainManager.longestChainTip
            let txs = mempool.getTxIds()
            let timestamp = Math.floor(new Date().getTime() / 1000)
            this.newBlock.previd = chainTip.blockid
            this.newBlock.created = timestamp 
            this.newBlock.txids = txs
            this.newBlock.height = chainManager.longestChainHeight + 1

            //Check PoW, if false then increase nonce
            if (this.newBlock.hasPoW()){
                return this.newBlock
            } else {
                this.newBlock.nonce += 1;
            }

        }
    }
}

export const miner = new Miner('vbarnard');