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
exports.miner = exports.Miner = void 0;
const chain_1 = require("./chain");
const block_1 = require("./block");
const mempool_1 = require("./mempool");
const block_2 = require("./block");
const fs_1 = require("fs");
const path_1 = require("path");
class Miner {
    constructor(studentid) {
        this.studentids = [studentid];
        let txs = mempool_1.mempool.getTxIds();
        let currtime = Math.floor(new Date().getTime() / 1000);
        this.newBlock = new block_2.Block(null, txs, '0000000000000000000000000000000000000000000000000000000000000000', block_1.TARGET, currtime, 'Vanessa :)', 'Block mined for hw6!', this.studentids);
    }
    syncWriteFile(data) {
        (0, fs_1.writeFileSync)((0, path_1.join)(__dirname, 'mineLog.txt'), data, {
            flag: 'a+'
        });
    }
    mine(chainTip) {
        return __awaiter(this, void 0, void 0, function* () {
            //let chainTip : Block = await Block.makeGenesis()
            yield chain_1.chainManager.init();
            while (true) {
                //let chaintip = chainManager.longestChainTip
                let txs = mempool_1.mempool.getTxIds();
                let timestamp = Math.floor(new Date().getTime() / 1000);
                this.newBlock.previd = chainTip.blockid;
                this.newBlock.created = timestamp;
                this.newBlock.txids = txs;
                this.newBlock.height = chain_1.chainManager.longestChainHeight + 1;
                //Check PoW, if false then increase nonce
                if (this.newBlock.hasPoW()) {
                    return this.newBlock;
                }
                else {
                    this.newBlock.nonce += 1;
                }
            }
        });
    }
}
exports.Miner = Miner;
exports.miner = new Miner('vbarnard');
