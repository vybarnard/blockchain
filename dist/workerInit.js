"use strict";
// import { Worker, WorkerOptions } from "worker_threads";
// function importWorker(path: string, options?: WorkerOptions) {
//     const resolvedPath = require.resolve(path);
//     return new Worker(resolvedPath, {
//         ...options,
//         execArgv: /\.ts$/.test(resolvedPath) ? ["--require", "ts-node/register"] : undefined,
//     });
// }
// export const worker = importWorker('./worker.ts')
// worker.on('error',(err) => {
//     console.error(err)
// })
// worker.on('message', (data) => {
//     console.log(data)
// })
