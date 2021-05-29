import { Lrc } from "lrc-kit"

export const AXIOS_TIMEOUT: number = 2000

export interface LyricsSearchResult {
    providerName: string
    name: string
    artist?: string
    album?: string
    artwork?: string
    parameter: object
}

export interface LyricsProvider {
    providerName: string
    search(name: string, artist?: string, album?: string, duration?: number): Promise<LyricsSearchResult[]>
    getLyric(searchResult: LyricsSearchResult, useTranslation?: boolean, integrateTranslation?: boolean): Promise<Lrc>
}

export { Lrc }