import { ObjectId, ObjectStorage } from './store'
import { AnnotatedError,
         TransactionInputObjectType,
         TransactionObjectType,
         TransactionOutputObjectType,
         OutpointObjectType,
         SpendingTransactionObject, BlockObject, BlockObjectType } from './message'
import { PublicKey, Signature, ver } from './crypto/signature'
import { canonicalize } from 'json-canonicalize'
import { network, eventEmitter} from './network'
import { EventEmitter } from 'node:events'
import { Transaction } from './transaction'

export class Block {
  T: string
  created: number
  miner: string
  nonce: string
  note: string
  previd: string | null
  txids: string[]
  type: string
  blockid: string

  static fromNetworkObject(txObj: BlockObjectType): Block {
    return new Block(txObj.T, txObj.created, txObj.miner, txObj.nonce, txObj.note, txObj.previd, txObj.txids, txObj.type, ObjectStorage.id(txObj))
  }
  static async byId(blockid: ObjectId): Promise<Block> {
    return this.fromNetworkObject(await ObjectStorage.get(blockid))
  }
  constructor(T: string, created: number, miner: string, nonce: string, note: string, previd: string | null, txids: string[], type: string, blockid: string) {
    this.T = T;
    this.created = created;
    this.miner = miner;
    this.nonce = nonce;
    this.note = note;
    this.previd = previd;
    this.txids = txids;
    this.type = type;
    this.blockid = blockid;
  }
  async validate() {

    const target = "00000000abc00000000000000000000000000000000000000000000000000000"
    if (!(this.T === target)) {
        throw new AnnotatedError('INVALID_FORMAT', `Incorrect block target, should be ${target} but was ${this.T}`)
    }

    if (this.blockid >= this.T) {
        throw new AnnotatedError('INVALID_BLOCK_POW', `Invalid POW, block id ${this.blockid} is less than ${this.T}`)
    }

    function waitForFire(){
        return new Promise<string>((resolve, reject) => {
            const timeout = setTimeout(() =>{
                reject(new Error('Timed out'));
            }, 6000);
            eventEmitter.once('ihaveobject', (data) => {
                resolve(data);
            })
        })
    }

    let coinbaseTx : Transaction | null = null;
    let firstCoinbase = true;
    for(const txid of this.txids) {
        try {
            const txstored = await ObjectStorage.get(txid);
            const tx = Transaction.fromNetworkObject(txstored);
            tx.validate();
            if(tx.height !== null) {
                if(coinbaseTx !== null) {
                    throw new AnnotatedError('INVALID_BLOCK_COINBASE', `More than one coinbase transaction, the current one being with txid ${tx.txid}`)
                }
                coinbaseTx = tx;
                if(!firstCoinbase) {
                    throw new AnnotatedError('INVALID_BLOCK_COINBASE', `The coinbase transaction is not the first transaction listed, the current one being with txid ${tx.txid}`)
                }
                firstCoinbase = false;
            } else {
                if (coinbaseTx !== null) {
                    for (const input of tx.inputs){
                        if (input.outpoint.txid === coinbaseTx.txid) {
                            throw new AnnotatedError('INVALID_TX_OUTPOINT', `Transaction ${tx.txid} is spending coinbase transaction ${coinbaseTx.txid} in current block`);
                        }
                    }
                }

            }
            
        } catch (error) {
            try {
                setTimeout(() => {
                    network.broadcast({
                        type: 'getobject',
                        objectid: txid
                    })
                }, 1000);
                const data = await waitForFire();
            } catch (error) {
                throw new AnnotatedError('UNFINDABLE_OBJECT', `Invalid transaction object with txid ${txid}`)
            }

        }
        
    }
  }
}