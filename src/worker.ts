import { BlockObjectType } from "./message";
import { miner } from "./miner";
import { parentPort, workerData } from "worker_threads";
import { Block } from "./block";
import { canonicalize } from "json-canonicalize";

//TO DO, FIX MY PUB KEY
//export const pk = '3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f';
//export const payee = '3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f';

function mineNewBlock(newBlock: Block){
    let mine = miner.mine(newBlock)
    return mine
}

console.log(`AM I GETTING HERE`)
const minedBlock = mineNewBlock(workerData.newBlock)

parentPort?.postMessage(minedBlock)