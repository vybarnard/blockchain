"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payee = exports.pk = void 0;
const miner_1 = require("./miner");
const network_1 = require("./network");
const object_1 = require("./object");
const worker_threads_1 = require("worker_threads");
//TO DO, FIX MY PUB KEY
exports.pk = '3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f';
exports.payee = '3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f';
function mineNewBlock(chainTip) {
    return __awaiter(this, void 0, void 0, function* () {
        let mine = yield miner_1.miner.mine(chainTip);
        let coinbase = {
            height: mine.height,
            outputs: [{
                    pubkey: exports.pk,
                    value: 50000000000
                }],
            type: "transaction"
        };
        yield object_1.objectManager.put(coinbase);
        for (const peer of network_1.network.peers) {
            yield peer.sendIHaveObject(coinbase);
            yield peer.sendObject(coinbase);
        }
        for (const peer of network_1.network.peers) {
            yield peer.sendObject(mine.toNetworkObject);
        }
        return mine;
    });
}
console.log(`AM I GETTING HERE`);
worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage(mineNewBlock(worker_threads_1.workerData.chainTip));
