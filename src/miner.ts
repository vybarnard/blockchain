import { Block } from './block'
import { BlockObjectType } from './message';
import { TARGET } from './block';

export class Miner {

    mine(newBlock: Block){
        console.log('mine')
        //const easyTarget = 'abc0000000000000000000000000000000000000000000000000000000000000'
        while(true){
            //Check PoW, if false then increase nonce
            if (BigInt(`0x${newBlock.blockid}`) <= BigInt(`0x${TARGET}`)){
                return newBlock
            } else {
                newBlock.nonce += 1;
            }
        }
    }
}

export const miner = new Miner();