import * as events from "events"
import * as child from "child_process"
import { logger } from "./logger"

interface SerializedEventEmitterInterface {
    postMessage?(value: any, transferList?): void
    send?(message: child.Serializable, sendHandle?: child.SendHandle, callback?: (error: Error | null) => void): boolean
    emit(event: string | symbol, ...args: any[]): boolean
    on(event: string | symbol, listener: (...args: any[]) => void): this
    once(event: string | symbol, listener: (...args: any[]) => void): this
}

function unmarshalEventJSON(message: string) : [string, any[]] {
    let realEvent: string, realArgs: any[]
    try {
        [realEvent, ...realArgs] = JSON.parse(message)
    } catch (e) {
        logger("SerializedEventEmitter: Bad JSON " + e.stack)
        return [null, []]
    }
    return [realEvent, realArgs]
} 

function listenerWrapper(message: string, event: string | symbol, listener: (...args: any[]) => void) {
    let [realEvent, realArgs] = unmarshalEventJSON(message)
    if (realEvent == event)
        return listener(...realArgs)
    return
}

function listenerWrapperAll(message: string, listener: (event: string | symbol, ...args: any[]) => void) {
    let [realEvent, realArgs] = unmarshalEventJSON(message)
    if (realEvent)
        return listener(realEvent, ...realArgs)
    return
}

export class SerializedEventEmitter extends events.EventEmitter {
    msgPort: SerializedEventEmitterInterface
    extraPorts: SerializedEventEmitterInterface[]
    eventBlacklists: object
    constructor(msgPort: SerializedEventEmitterInterface, extraPorts: SerializedEventEmitterInterface[] = [], eventBlacklists?: Object) {
        super()
        this.msgPort = msgPort
        this.extraPorts = extraPorts
        this.eventBlacklists = eventBlacklists
    }

    public emit(event: string | symbol, ...args: any[]): boolean {
        let blacklist: SerializedEventEmitterInterface[] = []
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
            port.on("message", (message: string) => listenerWrapper(message, event, listener))
        }
        return this.msgPort.on("message", (message: string) => listenerWrapper(message, event, listener))
    }
    
    public once(event: string | symbol, listener: (...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.once("message", (message: string) => listenerWrapper(message, event, listener))
        }
        return this.msgPort.once("message", (message: string) => listenerWrapper(message, event, listener))
    }

    public onAll(listener: (event: string | symbol, ...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.on("message", (message: string) => listenerWrapperAll(message, listener))
        }
        return this.msgPort.on("message", (message: string) => listenerWrapperAll(message, listener))
    }

    public onceAll(listener: (event: string | symbol, ...args: any[]) => void): any {
        for (let port of this.extraPorts) {
            port.once("message", (message: string) => listenerWrapperAll(message, listener))
        }
        return this.msgPort.once("message", (message: string) => listenerWrapperAll(message, listener))
    }
}