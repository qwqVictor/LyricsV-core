import { PlayerInterface } from "../../../../type/PlayerInterface"
import { Track } from "../../../../entity/Track"

/*let winax
try {
    winax = require("winax")
} catch(e) {
    throw new Error("You can't use this module without 'winax' installed on Windows")   
}*/

export default class iTunesMusic implements PlayerInterface {
    private iTunesApp: any
    private _currentTrack : Track
    public readonly CHECK_INTERVAL: number = 50
    constructor() { }

    public get isRunning() : boolean {
        return false
    }

    public get currentTrack() : Track {
        return this._currentTrack
    }

    public get isPlaying() : boolean {
        return false
    }
    
    public get playerPosition() : number {
        return 0.0
    }

    public seek(pos: number) : boolean {
        return false
    }

    public writeLyrics(lyrics: string) : void {

    }
}