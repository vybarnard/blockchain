import { logger } from './logger'
import { network } from './network'
import { chainManager } from './chain'
import { mempool } from './mempool'
import { AnnotatedError, BlockObject } from './message'
import { parentPort } from 'worker_threads'
import { Worker } from 'worker_threads'

const BIND_PORT = 18018
const BIND_IP = '0.0.0.0'

//45.77.189.227

logger.info(`Malibu - A Marabu node`)
logger.info(`Dionysis Zindros <dionyziz@stanford.edu>`)

async function main() {
  await chainManager.init()
  await mempool.init()
  network.init(BIND_PORT, BIND_IP)
}

main()
