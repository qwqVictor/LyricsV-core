import { LyricsProvider, LyricsSearchResult, Lrc, AXIOS_TIMEOUT } from "../../type/lyrics"
import { integrateLyrics } from "../../util/integrateLyrics"
import { AxiosInstance, default as axios } from "axios"
import { logger } from "../../util/logger"
import { unwrapJSONP } from "../../util/unwrapJSONP"

export class QQMusic implements LyricsProvider {
    public readonly providerName: string = "QQMusic"
    private readonly qqBaseURLString: string = "https://c.y.qq.com"
    private readonly qqSearchBaseURLString: string = "/soso/fcgi-bin/client_search_cp"
    private readonly qqLyricsBaseURLString: string = "/lyric/fcgi-bin/fcg_query_lyric_new.fcg"
    private axios: AxiosInstance

    constructor() {
        this.axios = axios.create({
            baseURL: this.qqBaseURLString,
            headers: {
                "Referer": "https://y.qq.com/portal/player.html"
            },
            responseType: 'json',
            timeout: AXIOS_TIMEOUT
        })
    }

    public async search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]> {
        let response = await this.axios.get(this.qqSearchBaseURLString , {
            params: {
                format: "json",
                w: [name, artist].join(' '),
                n: 25
            }
        }).catch((reason) => {
            logger("LyricsProvider[QQMusic]: failed to search " + reason)
            return null
        })
        try {
            let dataObj: any
            if (typeof response.data == "string")
                dataObj = unwrapJSONP(response.data)
            else
                dataObj = response.data
            let ret: LyricsSearchResult[] = []
            if (dataObj.data["song"]) {
                for (let song of dataObj.data.song.list) {
                    ret.push({
                        providerName: this.providerName,
                        name: song.songname,
                        artist: song.singer.reduce((sum: string, cur) => { return sum += '/' + cur.name }, "").substr(1),
                        album: song.albumid,
                        parameter: {
                            songmid: song.mid
                        }
                    })
                }
            }
            return ret
        } catch (e) {
            logger("LyricsProvider[QQMusic]: failed to search " + e.stack)
            return null
        }
    }

    public async getLyric(searchResult: LyricsSearchResult, useTranslation: boolean = true, integrateTranslation?: boolean): Promise<Lrc> {
        const noLyric = "[00:00:00]此歌曲为没有填词的纯音乐，请您欣赏"
        let response = await this.axios.get(this.qqLyricsBaseURLString, {
            params: {
                format: "json",
                songmid: searchResult.parameter["songmid"],
                g_tk: 5381
            }
        }).catch((reason) => {
            logger("LyricsProvider[QQMusic]: failed to get " + reason)
            return null
        })
        try {
            let dataObj: any
            if (typeof response.data == "string")
                dataObj = unwrapJSONP(response.data)
            else
                dataObj = response.data
            let lyricRaw = Buffer.from(dataObj.lyric || '', 'base64').toString()
            if (lyricRaw != "" && lyricRaw != noLyric) {
                let lyric = Lrc.parse(lyricRaw)
                if (useTranslation && dataObj.trans) {
                    let translationRaw = Buffer.from(dataObj.trans, 'base64').toString()
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
            logger("LyricsProvider[QQMusic]: failed to get " + e.stack)
            return null
        }
    }
}