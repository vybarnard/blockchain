import { BlockObjectType } from "./message";
import { miner } from "./miner";
import { parentPort, workerData } from "worker_threads";
import { Block } from "./block";
import { canonicalize } from "json-canonicalize";
import process from "process";

function mineNewBlock(newBlock: Block){
    let mine = miner.mine(newBlock)
    return mine
}

console.log(`Process id: ${process.pid}`)
console.time('Minig')
const minedBlock = mineNewBlock(workerData.newBlock)
console.timeEnd('Minig')

parentPort?.postMessage(minedBlock)