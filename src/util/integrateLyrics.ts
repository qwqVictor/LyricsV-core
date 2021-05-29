import { Lrc } from "lrc-kit"
export function integrateLyrics(lyric: Lrc, translation: Lrc) {
    let startTime = new Date().getTime()
    for (let i = 0, off = 0; i < lyric.lyrics.length; i++) {
        if (new Date().getTime() - startTime > 1000)
            break
        try {
            if (lyric.lyrics[i].timestamp < translation.lyrics[i + off].timestamp) {
                off--           // main lyric is behind translation, make offset negative to keep the sum zero
                continue
            }
            while (lyric.lyrics[i].timestamp > translation.lyrics[i + off].timestamp) {
                off++
            }
            if (lyric.lyrics[i].content.trim() != "" && translation.lyrics[i + off].content.trim() != "")
                lyric.lyrics[i].content += [' (', translation.lyrics[i + off].content , ')'].join('')
        } catch(e) {
            // there's no need to handle the exception
        }
    }
}