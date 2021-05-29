import * as events from "events"
import { PlayerInterface } from "../../type/PlayerInterface"
import iTunesMusic from "./iTunesMusic/iTunesMusic"
import { Track } from "../../entity/Track"

export class iTunesPlayer implements PlayerInterface {
    player: PlayerInterface
    emitter: events.EventEmitter
    private recentTrackUID: string
    private recentIsPlaying: boolean
    private recentPlayerPosition: number
    private eventIntervalObject: NodeJS.Timeout

    constructor(emitter?: events.EventEmitter) {
        this.player = new iTunesMusic()
        this.emitter = emitter
        this.recentTrackUID = this.currentTrack ? this.currentTrack.uid : null
        this.recentIsPlaying = this.isPlaying
        this.recentPlayerPosition = this.playerPosition
        this.eventIntervalObject = setInterval((emitter) => {
            if (!this.isRunning) {
                emitter.emit("playerQuit")
                clearInterval(this.eventIntervalObject)
                return
            }
            if (this.currentTrack) {
                try {
                    if (this.currentTrack.uid != this.recentTrackUID) {
                        emitter.emit("trackChange", this.currentTrack)
                        this.recentTrackUID = this.currentTrack.uid
                    }
                } catch(e) {
                    this.recentTrackUID = null
                    emitter.emit("trackChange", this.currentTrack)
                }
                if (this.isPlaying != this.recentIsPlaying) {
                    emitter.emit("togglePlayPause", this.isPlaying)
                    this.recentIsPlaying = this.isPlaying
                }
                if (this.recentPlayerPosition != this.playerPosition) {
                    emitter.emit("timeUpdate", this.playerPosition)
                    this.recentPlayerPosition = this.playerPosition
                }
            }
            else {
                if (this.recentTrackUID)
                    this.recentTrackUID = null
            }
        }, iTunesMusic.CHECK_INTERVAL, emitter)
    }

    public get isRunning() {
        return this.player.isRunning
    }

    public get currentTrack() : Track {
        return this.player.currentTrack
    }

    public get isPlaying() : boolean {
        return this.player.isPlaying
    }

    public get playerPosition() : number {
        return this.player.playerPosition || 0
    }

    public seek(pos: number) : boolean {
        if (!pos) return false
        if (pos < 0) return false
        return this.player.seek(pos)
    }

    public writeLyrics(lyrics: string) : void {
        if (lyrics)
            this.player.writeLyrics(lyrics)
    }
}