import { Block } from './block'
import { BlockObjectType } from './message';
import { TARGET } from './block';
import { canonicalize } from 'json-canonicalize';
import { hash } from './crypto/hash';

export class Miner {

    mine(newBlock: Block){
        //const easyTarget = 'abc0000000000000000000000000000000000000000000000000000000000000'
        while(true){
            //Check PoW, if false then increase nonce
            if (BigInt(`0x${hash(canonicalize(newBlock))}`) <= BigInt(`0x${TARGET}`)){
                return newBlock
            } else {
                newBlock.nonce += 1;
            }
        }
    }
}

export const miner = new Miner();