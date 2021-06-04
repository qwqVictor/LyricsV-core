import { isMainThread, MessagePort, workerData, parentPort } from "worker_threads"
import { PlayerInterface } from "../type/PlayerInterface"
import { SerializedEventEmitter } from "../util/SerializedEventEmitter"
import { iTunesPlayer } from "./itunes/itunes"

const PLAYERS = {
    "iTunes": iTunesPlayer
}
class PlayerWorker {
    player: PlayerInterface
    emitter: SerializedEventEmitter        // emitter for player, emit to all port
    parentPort: SerializedEventEmitter
    lyricsPort: SerializedEventEmitter

    onSeek = (pos: number) => {
        this.player.seek(pos)
    }
    
    constructor(playerName: string, parentPort: MessagePort, lyricsPort: MessagePort, emitterBlacklist?: Object) {
        this.parentPort = new SerializedEventEmitter(parentPort)
        this.lyricsPort = new SerializedEventEmitter(lyricsPort)
        this.emitter = new SerializedEventEmitter(parentPort, [lyricsPort], emitterBlacklist)
        if (PLAYERS.hasOwnProperty(playerName)) {
            this.player = new PLAYERS[playerName](this.emitter)
            if (this.player.currentTrack && this.player.isPlaying) {
                this.emitter.emit("trackChange", this.player.currentTrack)
            }
        }
        this.parentPort.on("seek", this.onSeek)
    }
}

if (isMainThread) {
    throw new Error("This can only be run as worker thread")
}
else {
    let playerName: string
    let lyricsPort: MessagePort
    if (workerData.hasOwnProperty("player"))
        playerName = workerData.player
    if (workerData.hasOwnProperty("lyricsPort"))
        lyricsPort = workerData.lyricsPort
    let worker = new PlayerWorker(playerName, parentPort, lyricsPort, {
        "timeUpdate": [ parentPort ]
    })
}