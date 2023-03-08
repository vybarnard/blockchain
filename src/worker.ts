import { BlockObjectType, TransactionObjectType } from "./message";
import { Miner, miner } from "./miner";
import { network } from "./network";
import { objectManager } from "./object";
import { Transaction } from "./transaction";
import { parentPort, workerData } from "worker_threads";
import { Block } from "./block";

//TO DO, FIX MY PUB KEY
export const pk = '3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f';
export const payee = '3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f';

parentPort?.postMessage(mineNewBlock(workerData.chainTip))

async function mineNewBlock(chainTip: Block){
    let mine = await miner.mine(chainTip)
    let coinbase : TransactionObjectType = {
        height : mine.height!,
        outputs : [{
            pubkey: pk,
            value: 50000000000
        }],
        type: "transaction"
    }
    await objectManager.put(coinbase)

    for (const peer of network.peers){
        await peer.sendIHaveObject(coinbase)
        await peer.sendObject(coinbase)
    }

    for (const peer of network.peers){
        await peer.sendObject(mine.toNetworkObject)
    }
    
    return mine
}