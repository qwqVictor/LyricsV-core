import { isMainThread, MessagePort, workerData, parentPort } from "worker_threads"
import { JSONEventEmitter } from "../util/JSONEventEmitter"
import { Track } from "../entity/Track"
import { Lrc, Runner as LrcRunner } from "lrc-kit"
import { searchLyrics, getLyric, PROVIDERS } from "./getLyrics"
import { LyricsProvider, LyricsSearchResult } from "../type/lyrics"
import { Config } from "../type/config"
import { Persistence, PersistenceArgType } from "./persistence/persistence"
import { logger, loggerVerbose } from "../util/logger"
import { readFileAsync, unlinkAsync } from "../util/promisifiedFs"
import * as path from "path"

class LyricsWorker {
    private playerPort: JSONEventEmitter
    private parentPort: JSONEventEmitter
    private currentTrack: Track
    private currentLyric: Lrc
    private lrcRunner: LrcRunner
    private previewTrack: Track
    private lrcPreviewRunner: LrcRunner
    private recentIndex: number = -1
    private recentPreviewIndex: number = -1
    private usingProviders: LyricsProvider[]
    private persistence: Persistence
    private config: Config

    onTrackChange = async (track: Track) => {
        this.parentPort.emit("lyricChange", null, 0)
        this.currentTrack = track
        if (track)
            this.currentLyric = await this.getLyrics(track)
        else
            this.currentLyric = null
        loggerVerbose("Lyrics getLyrics: got lyric", this.currentLyric)
        if (this.currentLyric) {
            this.lrcRunner.setLrc(this.currentLyric)
            this.parentPort.emit("lyricChange", this.lrcRunner.getLyrics(), Number(this.currentLyric.info.offset) || 0)
            this.persistLyrics(track, this.currentLyric)
        } else {
            this.lrcRunner.setLrc(new Lrc())
        }
    }

    onTimeUpdate = async (pos: number) => {
        if (this.lrcRunner) {
            this.lrcRunner.timeUpdate(pos)
            let index = this.lrcRunner.curIndex()
            if (this.recentIndex != index) {
                this.parentPort.emit("lyricIndex", index)
                this.recentIndex = index
            }
        }
        if (this.previewTrack && this.currentTrack && this.previewTrack.uid == this.currentTrack.uid) {
            this.lrcPreviewRunner.timeUpdate(pos)
            let index = this.lrcPreviewRunner.curIndex()
            if (this.recentPreviewIndex != index) {
                this.parentPort.emit("lyricPreviewIndex", index, this.previewTrack.uid)
                this.recentPreviewIndex = index
            }
        }
    }

    onDisableLyrics = async (trackUID: string) => {
        if (this.currentTrack && this.currentTrack.uid == trackUID) {
            this.lrcRunner.setLrc(new Lrc())
            this.parentPort.emit("lyricChange", null, 0)
            await this.persistLyrics(this.currentTrack, null, true)
        }
    }

    onSearchLyrics = async (transactionId: number, track: Track) => {
        let searchResults: LyricsSearchResult[] = await searchLyrics(track, this.usingProviders)
        this.parentPort.emit("lyricsSearchResult", transactionId, searchResults)
    }

    onGetLyrics = async (transactionId: number, searchResult: LyricsSearchResult, track: Track, preview?: boolean) => {
        let result = await getLyric(searchResult, this.config.useTranslation, this.config.integrateTranslation)
        this.parentPort.emit("lyricsGot", transactionId, result)
        if (result && preview) {
            this.previewTrack = track
            this.recentPreviewIndex = -1
            this.lrcPreviewRunner.setLrc(result)
        }
    }

    onCancelPreview = async () => {
        this.previewTrack = null
        this.recentPreviewIndex = -1
        this.lrcPreviewRunner.setLrc(new Lrc())
    }

    onSetLyrics = async (track: Track, lyricPassed: Lrc | string, offset?: number) => {
        let lyric: Lrc
        try {
            if (typeof lyricPassed == "string")
                lyric = Lrc.parse(lyricPassed)
            else
                lyric = lyricPassed
        } catch(e) {
            logger("Lyrics onSetLyrics: error parsing string lyric")
        }
        if (offset || offset === 0)
            lyric.info.offset = String(offset)
        if (this.currentTrack && track && this.currentTrack.uid == track.uid)
            this.setLyrics(this.currentTrack, lyric)
        else {
            this.persistLyrics(track, lyric)
        }
    }

    onSetOffset = async (trackUID: string, offset: number) => {
        if (this.currentTrack && this.currentTrack.uid == trackUID && !this.currentTrack.disabledLyric) {
            this.currentLyric.offset(offset)
            this.currentLyric.info.offset = String((Number(this.currentLyric.info.offset) || 0) + offset)
            await this.setLyrics(this.currentTrack, this.currentLyric)
        }
    }

    onUpdateConfig = (config: Config) => {
        for (let key of Object.keys(config)) {
            this.config[key] = config[key]
        }
        let usingProviders: LyricsProvider[] = []
        if (this.config.providers) {
            for (let providerName of config.providers) {
                let provider = PROVIDERS[providerName]
                if (provider)
                    usingProviders.push(provider)
            }
        }
        else {
            usingProviders = Object.values(PROVIDERS)
        }
        this.usingProviders = usingProviders

        global['DEBUG'] = config.debug
        global['VERBOSE'] = config.verbose
    }

    constructor(parentPort: MessagePort, playerPort: MessagePort, config: Config) {
        this.currentTrack = null
        this.currentLyric = null

        this.config = config
        this.onUpdateConfig(config)
        
        this.lrcRunner = new LrcRunner()
        this.lrcPreviewRunner = new LrcRunner()

        this.playerPort = new JSONEventEmitter(playerPort)
        this.parentPort = new JSONEventEmitter(parentPort)

        this.persistence = new Persistence(config.player, config.basePath)

        this.playerPort.on("trackChange", this.onTrackChange)
        this.playerPort.on("timeUpdate", this.onTimeUpdate)

        this.parentPort.on("updateConfig", this.onUpdateConfig)
        this.parentPort.on("disableLyrics", this.onDisableLyrics)
        this.parentPort.on("searchLyrics", this.onSearchLyrics)
        this.parentPort.on("getLyrics", this.onGetLyrics)
        this.parentPort.on("setLyrics", this.onSetLyrics)
        this.parentPort.on("setOffset", this.onSetOffset)
    }

    async setLyrics(track: Track, lyricResult: Lrc) : Promise<void> {
        if (lyricResult) {
            this.lrcRunner.setLrc(lyricResult)
            this.parentPort.emit("lyricChange", this.lrcRunner.getLyrics(), String((Number(this.currentLyric.info.offset) || 0)))
            await this.persistLyrics(track, lyricResult)
        } else {
            this.lrcRunner.setLrc(new Lrc())
        }
    }

    async getLyrics(track: Track) : Promise<Lrc> {
        if (await this.disabledLyrics(track))
            return
        this.currentLyric = await this.getLocalLyrics(track)
        if (!this.currentLyric) {
            let lyricSearchResults = await searchLyrics(track, this.usingProviders)
            try {
                for (let result of lyricSearchResults) {
                    this.currentLyric = await getLyric(result, this.config.useTranslation, this.config.integrateTranslation)
                    if (this.currentLyric)
                        break
                }
            } catch(e) {
                this.currentLyric = null
            }
        }
        return this.currentLyric
    }

    async disabledLyrics(track: Track) : Promise<boolean> {
        if (this.persistence.noPersistence)
            return false
        try {
            return (await this.persistence.getTrack(track.uid) || { disabledLyric: false }).disabledLyric
        } catch(e) {
            logger("Lyrics disabledLyrics: failed to determine if disabled lyrics " + e.stack)
        }
        return false
    }

    async getLocalLyrics(track: Track) : Promise<Lrc> {
        let lyric: Lrc
        if (track.location && this.config.useLyricsBeside) {
            let lrcFilename: string
            let base = path.basename(track.location), dir = path.dirname(track.location)
            let lastdot = base.lastIndexOf('.')
            if (lastdot == -1) {
                lrcFilename = base + '.lrc'
            } else {
                lrcFilename = base.substr(0, lastdot) + '.lrc'
            }
            lrcFilename = path.join(dir, lrcFilename)
            try {
                let lrcRaw = (await readFileAsync(lrcFilename)).toString()
                if (lrcRaw) {
                    lyric = Lrc.parse(lrcRaw)
                    if (lyric.info.offset) {
                        lyric.offset(Number(lyric.info.offset) || 0)
                        lyric.info._lvsource = 'beside'
                    }
                    return lyric
                } else {
                    throw new Error("<- unable to read lrcfile or lrc is empty")
                }
            } catch(e) {
                logger("Lyrics getLocalLyrics: failed to get lyrics beside the music file" + e.stack)
            }
        }
        if (this.persistence.noPersistence)
            return null
        try {
            let lrcRaw = await this.persistence.getLRCFile(track)
            if (!lrcRaw) {
                return null
            }
            lyric = Lrc.parse(lrcRaw)
            let offset = (await this.persistence.getTrack(track.uid)).lrcOffset || 0
            lyric.offset(offset)
            lyric.info.offset = String(offset)
            return lyric
        } catch(e) {
            logger("Lyrics getLocalLyrics: failed to get local lyrics " + e.stack)
        }
        return null
    }

    async persistLyrics(track: Track, lyrics: Lrc, remove?: boolean) {
        if (this.persistence.noPersistence || (lyrics && lyrics.info && lyrics.info._lvsource == "beside")) {
            return false
        }
        logger("Lyrics persistLyrics: start to persist for track " + track.name + " - " + track.artist)
        try {
            let trackToUpdate = await this.persistence.getTrack(track.uid) || track, lrcFile: string
            if (remove)
                lrcFile = trackToUpdate.lrcFile
            else
                lrcFile = await this.persistence.saveLRCFile(track, lyrics.toString({sort: true}))
            if (lrcFile) {
                if (remove) {
                    trackToUpdate.lrcFile = ""
                    trackToUpdate.lrcOffset = 0
                    trackToUpdate.disabledLyric = true
                    await unlinkAsync(lrcFile)
                } else {
                    trackToUpdate.lrcFile = lrcFile
                    trackToUpdate.lrcOffset = Number(lyrics.info.offset || 0)
                    trackToUpdate.disabledLyric = false
                }
                this.persistence.updateTrackData(track, ["lrcFile", trackToUpdate.lrcFile], ["lrcOffset", trackToUpdate.lrcOffset])
            }
        } catch(e) {
            logger("Lyrics persistLyrics: failed to persist lyrics " + e.stack)
        }
    }
}

if (isMainThread) {
    throw new Error("This can only be run as worker thread")
}
else {
    let playerPort: MessagePort
    let persistenceArgs: PersistenceArgType
    let config: Config
    if (workerData && workerData.hasOwnProperty("config"))
        config = workerData.config
    else
        throw new Error("Missing config")
    if (workerData && workerData.hasOwnProperty("playerPort"))
        playerPort = workerData.playerPort
    if (workerData && workerData.hasOwnProperty("debug")) {
        global['DEBUG'] = Boolean(workerData.debug)
    }
    let worker = new LyricsWorker(parentPort, playerPort, config)
}