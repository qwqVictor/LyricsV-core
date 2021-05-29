import { LyricsProvider, LyricsSearchResult, Lrc, AXIOS_TIMEOUT } from "../../type/lyrics"
import { logger } from "../../util/logger"
import { AxiosInstance, default as axios } from "axios"

export class KuwoMusic implements LyricsProvider {
    public readonly providerName: string = "KuwoMusic"
    private readonly kwSearchBaseURLString: string = "http://search.kuwo.cn/r.s"
    private readonly kwLyricsBaseURLString: string = "http://m.kuwo.cn/newh5/singles/songinfoandlrc"
    private axios: AxiosInstance

    constructor() {
        this.axios = axios.create({
            headers: {},
            responseType: 'json',
            timeout: AXIOS_TIMEOUT
        })
    }

    public async search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]> {
        let response = await this.axios.get(this.kwSearchBaseURLString, { 
            params: {
                all: [name, artist].join(' '),
                ft: 'music',
                itemset: 'web_2013',
                pn: 0,
                rn: 25,
                rformat: 'json',
                encoding: 'utf8'
            }
        }).catch((reason) => {
            logger("LyricsProvider[KuwoMusic]: failed to search " + reason)
            return null
        })
        try {
            let dataStr: string = response.data
            dataStr = dataStr.replace(/'/g, "\"")
            let dataObj = JSON.parse(dataStr)
            let ret: LyricsSearchResult[] = []
            for (let song of dataObj.abslist) {
                ret.push({
                    providerName: this.providerName,
                    name: song.NAME,
                    artist: song.ARTIST,
                    album: song.ALBUM,
                    parameter: {
                        id: String(song.MUSICRID).replace('MUSIC_', '')
                    }
                })
            }
            return ret
        } catch (e) {
            logger("LyricsProvider[KuwoMusic]: failed to search " + e.stack)
            return null
        }
    }

    public async getLyric(searchResult: LyricsSearchResult, useTranslation: boolean = true, integrateTranslation?: boolean): Promise<Lrc> {
        let response = await this.axios.get(this.kwLyricsBaseURLString, {
            params: {
                'musicId': searchResult.parameter["id"]
            }, 
            headers: {
                'referer': 'http://m.kuwo.cn/yinyue/' + searchResult.parameter["id"]
            }
        }).catch((reason) => {
            logger("LyricsProvider[KuwoMusic]: failed to get " + reason)
            return null
        })
        try {
            let dataObj = response.data, lyric: Lrc = new Lrc()
            for (let line of dataObj["data"]["lrclist"]) {
                lyric.lyrics.push({
                    timestamp: Number(line.time),
                    content: line.lineLyric
                })
            }
            return dataObj
        } catch (e) {
            logger("LyricsProvider[KuwoMusic]: failed to get " + e.stack)
            return null
        }
    }
}