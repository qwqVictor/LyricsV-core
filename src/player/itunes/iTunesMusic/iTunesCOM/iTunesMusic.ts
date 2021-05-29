import * as enums from "./enums"
import * as interfaces from "./interfaces"
import { Track } from "../../../../entity/Track"
import { PlayerInterface } from "../../../../type/PlayerInterface"

let winax
try {
    winax = require("winax")
} catch(e) {
    throw new Error("You can't use this module without 'winax' installed on Windows")   
}

export default class iTunesMusic implements PlayerInterface {
    private iTunesApp: any
    private ConnectionPoint: any
    private _currentTrack: Track
    public readonly CHECK_INTERVAL: number = 200
    constructor() {
        this.iTunesApp = new ActiveXObject("iTunes.Application")
        this.ConnectionPoint = winax.getConnectionPoints(this.iTunesApp)[0]
        this._currentTrack = new Track()
    }

    public get isRunning() : boolean {
        return Boolean(this.iTunesApp.version)
    }

    public get currentTrack_IT() : interfaces.ITTrack {
        return this.iTunesApp.currentTrack
    }

    public get currentTrack() : Track {
        let current = this.currentTrack_IT
        try {
            let persistentId = BigInt(winax.cast(this.iTunesApp.ITObjectPersistentIDHigh(current), 'uint')) << BigInt(32)
                             | BigInt(winax.cast(this.iTunesApp.ITObjectPersistentIDLow(current), 'uint'))              // Fuck Apple for the persistent ID
            this._currentTrack.uid = String(persistentId)
            this._currentTrack.name = current.Name || current.Location
            this._currentTrack.artist = current.Artist || ""
            this._currentTrack.album = current.Album || ""
            this._currentTrack.location = current.Location
            this._currentTrack.duration = current.Duration
        } catch(e) {
            return null
        }
        return this._currentTrack
    }

    public get playerState() : enums.ITPlayerState {
        return this.iTunesApp.playerState
    }

    public get isPlaying() : boolean {
        return this.playerState == enums.ITPlayerState.ITPlayerStatePlaying ||
               this.playerState == enums.ITPlayerState.ITPlayerStateFastForward ||
               this.playerState == enums.ITPlayerState.ITPlayerStateRewind
    }
    
    public get playerPosition() : number {
        if (this.playerState == enums.ITPlayerState.ITPlayerStatePlaying)
            this.iTunesApp.Resume()     // Fuck Apple for the update interval while unfocused https://stackoverflow.com/questions/52705713/itunes-com-playerpositionms-value-update-interval
        return this.iTunesApp.playerPositionMS / 1000.0
    }

    public seek(pos: number) : boolean {
        if (this.playerPosition) {
            this.iTunesApp.playerPosition = pos
            return true
        }
        else {
            return false
        }
    }

    public writeLyrics(lyrics: string) : void {
        this.iTunesApp.currentTrack.Lyrics = lyrics
    }
}