import { BLOCK_REWARD } from "./block"
import { TransactionObjectType } from "./message"
import * as ed from '@noble/ed25519';
import { canonicalize } from "json-canonicalize";

async function main(){
    const trans : TransactionObjectType = {
        "type": "transaction",
        "inputs": [
          {
            "outpoint": {
                //TO DO: put coinbase hash from explorer
              "txid": "f71408bf847d7dd15824574a7cd4afdfaaa2866286910675cd3fc371507aa196",
              "index": 0
            },
            "sig": null
          }
        ],
        "outputs": [
          {
            "pubkey": "3f0bc71a375b574e4bda3ddf502fe1afd99aa020bf6049adfe525d9ad18ff33f",
            "value": BLOCK_REWARD
          }
        ]
    }
    const message = Buffer.from(canonicalize(trans)).toString('hex')
    const signature = Buffer.from(await ed.sign(message, 'b45716e09d24ba10dfeb0c4bf139571246434a741caff6952b16181361134865')).toString('hex');
    trans.inputs[0].sig = signature

    const final_trans : Object = {
        "type": "object",
        "object": trans
      }

    console.log(`Canonicalized: ${canonicalize(final_trans)}`)
    console.log(`Non-Canonicalized: ${final_trans}`)
}

