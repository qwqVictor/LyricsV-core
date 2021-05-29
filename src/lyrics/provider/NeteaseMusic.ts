import { LyricsProvider, LyricsSearchResult, Lrc, AXIOS_TIMEOUT } from "../../type/lyrics"
import { integrateLyrics } from "../../util/integrateLyrics"
import { logger } from "../../util/logger"
import { AxiosInstance, default as axios } from "axios"

export class NeteaseMusic implements LyricsProvider {
    public readonly providerName: string = "NeteaseMusic"
    private readonly nmBaseURLString: string = "https://music.163.com/api/"
    private readonly nmSearchBaseURLString: string = "/search/pc"
    private readonly nmLyricsBaseURLString: string = "/song/lyric"
    private axios: AxiosInstance

    constructor() {
        this.axios = axios.create({
            baseURL: this.nmBaseURLString,
            headers: {
                "Referer": "https://music.163.com/#/"
            },
            responseType: 'json',
            timeout: AXIOS_TIMEOUT
        })
    }

    public async search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]> {
        let response = await this.axios.get(this.nmSearchBaseURLString , {
            params: {
                s: [name, artist].join(' '),
                offset: 0,
                limit: 25,
                type: 1
            }
        }).catch((reason) => {
            logger("LyricsProvider[NeteaseMusic]: failed to search " + reason)
            return null
        })
        try {
            let dataObj = response.data
            let ret: LyricsSearchResult[] = []
            for (let song of dataObj.result.songs) {
                
                ret.push({
                    providerName: this.providerName,
                    name: song.name,
                    artist: song.artists ? song.artists.reduce((sum, cur) => { return sum += '/' + cur.name }, "").substr(1) : null,
                    album: song.album["name"],
                    parameter: {
                        id: song.id
                    }
                })
            }
            return ret
        } catch (e) {
            logger("LyricsProvider[NeteaseMusic]: failed to search " + e.stack)
            return null
        }
    }

    public async getLyric(searchResult: LyricsSearchResult, useTranslation: boolean = true, integrateTranslation?: boolean): Promise<Lrc> {
        let response = await this.axios.get(this.nmLyricsBaseURLString, {
            params: {
                id: searchResult.parameter["id"],
                lv: 1,
                // kv: 1,
                tv: -1
            }
        }).catch((reason) => {
            logger("LyricsProvider[NeteaseMusic]: failed to get " + reason)
            return null
        })
        try {
            let dataObj = response.data
            if (dataObj.lrc && dataObj.lrc) {
                let lyricRaw = dataObj.lrc.lyric
                let lyric = Lrc.parse(lyricRaw)
                if (lyric.lyrics.length < 1)
                    return null
                if (useTranslation && dataObj.tlyric.lyric) {
                    let translationRaw = dataObj.tlyric.lyric
                    let translation = Lrc.parse(translationRaw)
                    if (integrateTranslation) {
                        integrateLyrics(lyric, translation)
                    }
                    else {
                        lyric = Lrc.parse(lyricRaw + "\n" + translationRaw)
                    }
                }
                return lyric
            } else {
                return null
            }
        } catch (e) {
            logger("LyricsProvider[NeteaseMusic]: failed to get " + e.stack)
            return null
        }
    }
}