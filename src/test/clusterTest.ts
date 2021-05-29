import * as cluster from "cluster"
import * as readline from "readline"
import { defaultConfig } from "../type/config"

cluster.setupMaster({
    exec: "../index.js",
    args: [JSON.stringify(defaultConfig)]
})

let core = cluster.fork()

core.on("message", (msgRaw: string) => {
    let event: string, args: any[]
    ;[event, ...args] = JSON.parse(msgRaw)
    console.log(`Got event: ${event}, ${JSON.stringify(args)}`)
})

let rl = readline.createInterface(
    process.stdin,
    process.stdout
)

rl.on('line', (input) => {
    core.send(input)
})