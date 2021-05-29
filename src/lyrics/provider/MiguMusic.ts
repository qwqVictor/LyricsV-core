import { LyricsProvider, LyricsSearchResult, Lrc, AXIOS_TIMEOUT } from "../../type/lyrics"
import { logger } from "../../util/logger"
import { AxiosInstance, default as axios } from "axios"

export class MiguMusic implements LyricsProvider {
    public readonly providerName: string = "MiguMusic"
    private readonly mgSearchBaseURLString: string = "https://m.music.migu.cn/migu/remoting/scr_search_tag"
    private readonly mgLyricsBaseURLString: string = "https://music.migu.cn/v3/api/music/audioPlayer/getLyric"
    private axios: AxiosInstance

    constructor() {
        this.axios = axios.create({
            responseType: 'json',
            timeout: AXIOS_TIMEOUT
        })
    }

    public async search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]> {
        let response = await this.axios.get(this.mgSearchBaseURLString , {
            params: {
                keyword: [name, artist].join(' '),
                type: 2,
                pgc: 1,
                rows: 25
            },
            headers: {
                'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
                'referer': 'https://m.music.migu.cn'
            }
        }).catch((reason) => {
            logger("LyricsProvider[MiguMusic]: failed to search " + reason)
            return null
        })
        try {
            let dataObj = response.data
            let ret: LyricsSearchResult[] = []
            for (let song of dataObj.musics) {
                ret.push({
                    providerName: this.providerName,
                    name: song.songName,
                    artist: song.singerName,
                    album: song.albumName,
                    parameter: {
                        id: song.copyrightId
                    }
                })
            }
            return ret
        } catch (e) {
            logger("LyricsProvider[MiguMusic]: failed to search " + e.stack)
            return null
        }
    }

    public async getLyric(searchResult: LyricsSearchResult, useTranslation: boolean = true, integrateTranslation?: boolean): Promise<Lrc> {
        let response = await this.axios.get(this.mgLyricsBaseURLString, {
            params: {
                copyrightId: searchResult.parameter["id"],  
            },
            headers: {
                'referer': 'https://music.migu.cn/v3/music/player/audio'
            }
        }).catch((reason) => {
            logger("LyricsProvider[MiguMusic]: failed to get " + reason)
            return null
        })
        try {
            let dataObj = response.data
            if (dataObj.lyric) {
                return Lrc.parse(dataObj.lyric)
            } else {
                return null
            }
        } catch (e) {
            logger("LyricsProvider[MiguMusic]: failed to get " + e.stack)
            return null
        }
    }
}