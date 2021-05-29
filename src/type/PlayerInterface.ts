import { Track } from "../entity/Track"
import { EventEmitter } from "events"
export declare interface PlayerInterface {

    isRunning : boolean

    currentTrack : Track

    isPlaying : boolean

    playerPosition : number

    emitter?: EventEmitter

    seek(pos: number): boolean

    writeLyrics(lyric: string) : void
}