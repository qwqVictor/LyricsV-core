import { LyricsProvider, LyricsSearchResult, Lrc } from "../type/lyrics"
import { logger } from "../util/logger"
import { Track } from "../entity/Track"
import { Gecimi } from "./provider/Gecimi"
import { KugouMusic } from "./provider/KugouMusic"
import { KuwoMusic } from "./provider/KuwoMusic"
import { MiguMusic } from "./provider/MiguMusic"
import { NeteaseMusic } from "./provider/NeteaseMusic"
import { QQMusic } from "./provider/QQMusic"

export const PROVIDERS = {
    "NeteaseMusic": new NeteaseMusic(),
    "QQMusic": new QQMusic(), 
    "KugouMusic": new KugouMusic(),
    "MiguMusic": new MiguMusic(),
    "KuwoMusic": new KuwoMusic(),
    "Gecimi": new Gecimi()
}

export async function searchLyrics(track: Track, providers: Array<LyricsProvider>): Promise<LyricsSearchResult[]> {
    let searchResults: LyricsSearchResult[] = []
    for (let provider of providers) {
        await provider.search(track.name, track.artist, track.album, track.duration).then((results: LyricsSearchResult[]) => {
            if (results) {
                for (let result of results) {
                    searchResults.push(result)
                }
            }
        })
    }
    return searchResults
}

export async function getLyric(searchResult: LyricsSearchResult, useTranslation?: boolean, integrateTranslation?: boolean): Promise<Lrc> {
    try {
        logger("Lyrics getLyrics: used lyric for " + searchResult.name + " - " + searchResult.artist + " got from " + searchResult.providerName)
        return await PROVIDERS[searchResult.providerName].getLyric(searchResult, useTranslation, integrateTranslation)
    } catch(e) {
        logger("Lyrics getLyrics: unable to get lyric " + e.stack)
        return null
    }
}