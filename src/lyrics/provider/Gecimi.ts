import { LyricsProvider, LyricsSearchResult, Lrc, AXIOS_TIMEOUT } from "../../type/lyrics"
import { logger } from "../../util/logger"
import { AxiosInstance, default as axios } from "axios"

export class Gecimi implements LyricsProvider {
    public readonly providerName: string = "Gecimi"
    private readonly gcmBaseURLString: string = "https://gecimi.com/api"
    private readonly gcmSearchBaseURLString: string = "/lyric/"
    private readonly gcmArtistBaseURLString: string = "/artist/"
    private axiosGCM: AxiosInstance
    private axios: AxiosInstance

    constructor() {
        this.axiosGCM = axios.create({
            baseURL: this.gcmBaseURLString,
            headers: {},
            responseType: 'json',
            timeout: AXIOS_TIMEOUT
        })
    }

    private async getArtistName(id: number) {
        
        let response = await this.axiosGCM.get(this.gcmArtistBaseURLString + id).catch((reason) => {
            logger("LyricsProvider[Gecimi]: failed to get artist name " + reason)
            return null
        })
        try {
            let dataObj = response.data
            return dataObj.result.name
        } catch(e) {
            logger("LyricsProvider[Gecimi]: failed to get artist name " + e.stack)
            return null
        }
    }

    public async search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]> {
        let response = await this.axiosGCM.get(this.gcmSearchBaseURLString + encodeURIComponent(name) + '/' + encodeURIComponent(artist)).catch((reason) => {
            logger("LyricsProvider[Gecimi]: failed to search " + reason)
            return null
        })
        try {
            let dataObj = response.data
            let ret: LyricsSearchResult[] = []
            for (let song of dataObj.result) {
                ret.push({
                    providerName: this.providerName,
                    name: song.song,
                    artist: await this.getArtistName(song.artist_id),
                    album: "",
                    parameter: {
                        lrc_url: song.lrc
                    }
                })
            }
            return ret
        } catch (e) {
            logger("LyricsProvider[Gecimi]: failed to search " + e.stack)
            return null
        }
    }

    public async getLyric(searchResult: LyricsSearchResult, useTranslation: boolean = true, integrateTranslation?: boolean): Promise<Lrc> {
        let response = await this.axios.get(searchResult.parameter["lrc_url"]).catch((reason) => {
            logger("LyricsProvider[Gecimi]: failed to get " + reason)
            return null
        })
        try {
            let lyricRaw = response.data
            let lyric = Lrc.parse(lyricRaw)
            return lyric
        } catch (e) {
            logger("LyricsProvider[Gecimi]: failed to get " + e.stack)
            return null
        }
    }
}