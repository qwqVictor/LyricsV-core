import { LyricsProvider, LyricsSearchResult, Lrc, AXIOS_TIMEOUT } from "../../type/lyrics"
import { logger } from "../../util/logger"
import { AxiosInstance, default as axios } from "axios"

export class KugouMusic implements LyricsProvider {
    public readonly providerName: string = "KugouMusic"
    private readonly kgSearchBaseURLString: string = "http://mobilecdn.kugou.com/api/v3/search/song"
    private readonly kgLyricsBaseURLString: string = "http://m.kugou.com/app/i/krc.php"
    private axios: AxiosInstance

    constructor() {
        this.axios = axios.create({
            headers: {},
            responseType: 'json',
            timeout: AXIOS_TIMEOUT
        })
    }

    public async search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]> {
        let response = await this.axios.get(this.kgSearchBaseURLString, { 
            params: {
                format: "json",
                platform: "WebFilter",
                keyword: [name, artist].join(' '),
                page: 1,
                pagesize: 25,
            },
            headers: {
                referer: 'http://m.kugou.com'
            }
        }).catch((reason) => {
            logger("LyricsProvider[KugouMusic]: failed to search " + reason)
            return null
        })
        try {
            let dataObj = response.data
            let ret: LyricsSearchResult[] = []
            for (let song of dataObj.data.info) {
                ret.push({
                    providerName: this.providerName,
                    name: song.songname,
                    artist: song.singername,
                    album: song.album_name,
                    parameter: {
                        hash: song.hash
                    }
                })
            }
            return ret
        } catch (e) {
            logger("LyricsProvider[KugouMusic]: failed to search " + e.stack)
            return null
        }
    }

    public async getLyric(searchResult: LyricsSearchResult, useTranslation: boolean = true, integrateTranslation?: boolean): Promise<Lrc> {
        let response = await this.axios.get(this.kgLyricsBaseURLString, {
            params: {
                cmd: 100,
                hash: searchResult.parameter["hash"],
                timelength: 999999
            }, 
            headers: {
                'referer': 'http://m.kugou.com/play/info/' + searchResult.parameter["hash"]
            }
        }).catch((reason) => {
            logger("LyricsProvider[KugouMusic]: failed to get " + reason)
            return null
        })
        try { 
            return Lrc.parse(response.data)
        } catch (e) {
            logger("LyricsProvider[KugouMusic]: failed to get " + e.stack)
            return null
        }
    }
}