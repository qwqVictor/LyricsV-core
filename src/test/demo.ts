import * as cluster from "cluster"
import * as readline from "readline"
import * as util from "util"
import { defaultConfig } from "../type/config"
import { Track } from "../entity/Track"
import { Lyric } from "lrc-kit"
import { JSONEventEmitter } from "../util/JSONEventEmitter"

const cursorToAsync = util.promisify(readline.cursorTo),
      clearLineAsync = util.promisify(readline.clearLine)

cluster.setupMaster({
    exec: "../index.js",
    args: [JSON.stringify(defaultConfig)]
})

let core = cluster.fork()
let currentLyric: Lyric[] = []

let coreEmitter = new JSONEventEmitter(core)

coreEmitter.on("trackChange", async (track: Track) => {
    await cursorToAsync(process.stdout, 0, 1)
    await clearLineAsync(process.stdout, 0)
    await cursorToAsync(process.stdout, 0, 1)
    if (track)
        console.log(track.name + ' - ' + track.artist)
})

coreEmitter.on("lyricChange", async (lyrics: Lyric[], offset: Number) => {
    currentLyric = lyrics
})

coreEmitter.on("lyricIndex", async (index: number) => {
    await cursorToAsync(process.stdout, 0, 4)
    await clearLineAsync(process.stdout, 0)
    await cursorToAsync(process.stdout, 0, 5)
    await clearLineAsync(process.stdout, 0)
    await cursorToAsync(process.stdout, 0, 4)
    if (currentLyric && currentLyric.length) {
        if (index > 0)
            console.log(currentLyric[index - 1].content)
        console.log(currentLyric[index].content)
    } else {
        console.log("No lyrics now.")
    }
})

coreEmitter.on("playerQuit", async () => {
    await cursorToAsync(process.stdout, 0, 7)
    console.log("The player has exited. I exit too!")
    process.exit()
})

readline.clearScreenDown(process.stdout)