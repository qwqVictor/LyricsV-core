import * as events from "events"
import * as child from "child_process"
import { logger } from "./logger"
import { stringify } from "querystring"

interface JSONEventEmitterInterface {
    postMessage?(value: any, transferList?): void
    send?(message: child.Serializable, sendHandle?: child.SendHandle, callback?: (error: Error | null) => void): boolean
    emit(event: string | symbol, ...args: any[]): boolean
    on(event: string | symbol, listener: (...args: any[]) => void): this
    once(event: string | symbol, listener: (...args: any[]) => void): this
}

function unmarshalEventJSON(jsonMsg: string) : [string, any[]] {
    let realEvent: string, realArgs: any[]
    try {
        [realEvent, ...realArgs] = JSON.parse(jsonMsg)
    } catch (e) {
        logger("JSONEventEmitter: Bad JSON " + e.stack)
        return [null, []]
    }
    return [realEvent, realArgs]
} 

function listenerWrapper(jsonMsg: string, event: string | symbol, listener: (...args: any[]) => void) {
    let [realEvent, realArgs] = unmarshalEventJSON(jsonMsg)
    if (realEvent == event)
        return listener(...realArgs)
    return
}

function listenerWrapperAll(jsonMsg: string, listener: (event: string | symbol, ...args: any[]) => void) {
    let [realEvent, realArgs] = unmarshalEventJSON(jsonMsg)
    if (realEvent)
        return listener(realEvent, ...realArgs)
    return
}

export class JSONEventEmitter extends events.EventEmitter {
    msgPort: JSONEventEmitterInterface
    extraPorts: JSONEventEmitterInterface[]
    eventBlacklists: object
    constructor(msgPort: JSONEventEmitterInterface, extraPorts: JSONEventEmitterInterface[] = [], eventBlacklists?: Object) {
        super()
        this.msgPort = msgPort
        this.extraPorts = extraPorts
        this.eventBlacklists = eventBlacklists
    }

    public emit(event: string | symbol, ...args: any[]): boolean {
        let blacklist: JSONEventEmitterInterface[] = []
        let payload: string = JSON.stringify([event, ...args])
        if (this.eventBlacklists && this.eventBlacklists.hasOwnProperty(event)) {
            blacklist = this.eventBlacklists[event]
        }
        for (let port of this.extraPorts) {
            if (blacklist.includes(port))
                continue
            if (port.postMessage) {
                port.postMessage(payload)
            } else if (port.send) {
                port.send(payload)
            } else {
                port.emit("message", payload)
            }
        }

        if (blacklist.includes(this.msgPort))
            return true
        if (this.msgPort.postMessage) {
            this.msgPort.postMessage(payload)
        } else if (this.msgPort.send) {
            this.msgPort.send(payload)
        } else {
            this.emit("message", payload)
        }

        return true
    }

    public on(event: string | symbol, listener: (...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.on("message", (jsonMsg: string) => listenerWrapper(jsonMsg, event, listener))
        }
        return this.msgPort.on("message", (jsonMsg: string) => listenerWrapper(jsonMsg, event, listener))
    }
    
    public once(event: string | symbol, listener: (...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.once("message", (jsonMsg: string) => listenerWrapper(jsonMsg, event, listener))
        }
        return this.msgPort.once("message", (jsonMsg: string) => listenerWrapper(jsonMsg, event, listener))
    }

    public onAll(listener: (event: string | symbol, ...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.on("message", (jsonMsg: string) => listenerWrapperAll(jsonMsg, listener))
        }
        return this.msgPort.on("message", (jsonMsg: string) => listenerWrapperAll(jsonMsg, listener))
    }

    public onceAll(listener: (event: string | symbol, ...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.once("message", (jsonMsg: string) => listenerWrapperAll(jsonMsg, listener))
        }
        return this.msgPort.once("message", (jsonMsg: string) => listenerWrapperAll(jsonMsg, listener))
    }
}