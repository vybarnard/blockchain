import { Block } from "./block";
import { logger } from "./logger";
import { Literal,
    Record, Array, Union,
    String, Number,
    Static, Null, Unknown, Optional } from 'runtypes'
import { chainManager } from './chain'
import { UTXO } from "./utxo";

class MempoolManager {
  
  mempool: string[] | null = null

  async init() {
    if (chainManager.longestChainTip === null){
        this.mempool = []
    } else {
        for(const tx of await chainManager.longestChainTip.UTXO()) {
            this.mempool = [];
            this.mempool.push(tx);
        }
    }
    
    this.mempool = [];
  }

}

export const mempoolManager = new MempoolManager()