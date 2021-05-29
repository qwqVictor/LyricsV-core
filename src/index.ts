import { Worker, MessageChannel, MessagePort, workerData, isMainThread, parentPort } from "worker_threads"
import { worker, Worker as WorkerCluster, isWorker as isWorkerCluster } from "cluster"
import { Config } from "./type/config"
import { JSONEventEmitter } from "./util/JSONEventEmitter"
import * as path from "path"
import * as process from "process"

class Core {
    workerCore: WorkerCluster | MessagePort
    playerWorker: Worker
    lyricsWorker: Worker
    emitter: JSONEventEmitter
    masterPort: JSONEventEmitter
    playerPort: JSONEventEmitter
    lyricsPort: JSONEventEmitter

    onQuit = () => {
        process.exit()
    }

    constructor(workerCore: WorkerCluster | MessagePort, config: Config) {
        this.workerCore = workerCore

        let {port1, port2} = new MessageChannel()

        this.playerWorker = new Worker(path.join(__dirname, 'player', 'playerWorker.js'), {
            workerData: {
                player: config.player,
                lyricsPort: port2
            },
            transferList: [ port2 ]
        })

        this.lyricsWorker = new Worker(path.join(__dirname, 'lyrics', 'lyricsWorker.js'), {
            workerData: {
                playerPort: port1,
                persistenceArgs: [ config.player ],
                config: config
            },
            transferList: [ port1 ]
        })
        
        this.masterPort = new JSONEventEmitter(this.workerCore)
        
        this.emitter = new JSONEventEmitter(this.lyricsWorker, [this.playerWorker])

        /**
         * forward all message from workers to master
         */
        this.emitter.onAll((event, ...args) => {
            this.masterPort.emit(event, ...args)
        })
        /**
         * forward all message from master to workers
         */
        this.masterPort.onAll((event, ...args) => {
            this.emitter.emit(event, ...args)
        })

        this.playerPort = new JSONEventEmitter(this.playerWorker)
        this.lyricsPort = new JSONEventEmitter(this.lyricsWorker)

        this.masterPort.on("quit", this.onQuit)
    }
}

if (isWorkerCluster) {
    let config: Config
    try {
        config = JSON.parse(process.argv[process.argv.length - 1])
    } catch(e) {
        throw new Error("Missing config or invalid config: " + e.stack)
    }
    let core = new Core(worker, config)
}
else if (!isMainThread) {
    let config: Config
    if (workerData && workerData.config)
        config = workerData.config
    else
        throw new Error("Missing config")
    let core = new Core(parentPort, config)
}