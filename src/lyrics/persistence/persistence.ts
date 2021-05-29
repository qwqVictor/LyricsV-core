import { createConnection, Connection, ConnectionOptions, Repository } from "typeorm"
import { logger } from "../../util/logger"
import { Track } from "../../entity/Track"
import { escapeFilename } from "../../util/escapeFilename"
import { readFileAsync, writeFileAsync } from "../../util/promisifiedFs"
import * as path from "path"
import * as fs from "fs"

const USER_HOME = process.env.HOME || process.env.USERPROFILE

export type PersistenceArgType = [playerName?: string, basePath?: string, dbPath?: string, lrcPath?: string]

export class Persistence {
    public connection: Connection
    public trackRepository: Repository<Track>
    public noPersistence: boolean
    public playerName: string
    private basePath: string
    private dbPath: string
    private lrcPath: string
    private ready: boolean

    public async updateTrackData(track: Track, ...args: [string, any][]) : Promise<boolean> {
        try {
            if (this.ready && !this.noPersistence) {
                let trackToUpdate = await this.getTrack(track.uid)
                trackToUpdate = trackToUpdate ? trackToUpdate : Track.clone(track)
                for (let kv of args) {
                    trackToUpdate[kv[0]] = kv[1]
                }
                await this.trackRepository.save(trackToUpdate)
                return true
            }
        } catch (e) {
            logger("Persistence updateTrackData: failed to update " + e.stack)
        }
        return false
    }

    public async getTrack(trackUID: string) : Promise<Track> {
        try {
            if (this.ready && !this.noPersistence) {
                return (await this.trackRepository.findOne(trackUID))
            }
        } catch (e) {
            logger("Persistence getTrack: failed to get " + e.stack)
        }
        return null
    }

    public async saveLRCFile(track: Track, content: string) : Promise<string> {
        if (this.ready && !this.noPersistence) {
            try {
                let filename = escapeFilename(track.uid + '-' + track.name + ' - ' + track.artist + '.lrc')
                let lrcFile = path.join(this.lrcPath, filename)
                await writeFileAsync(lrcFile, content)
                return lrcFile
            } catch(e) {
                logger("Persistence saveLRCFile: failed to save LRC " + e.stack)
            }
        }
        else
            return null
    }

    public async getLRCFile(track: Track) : Promise<string> {
        if (this.ready && !this.noPersistence) {
            try {
                let lrcFile = (await this.getTrack(track.uid) || track).lrcFile
                if (lrcFile)
                    return (await readFileAsync(lrcFile)).toString()
                else
                    return null
            } catch (e) {
                logger("Persistence getLRCFile: failed to get " + e.stack)
            }
        }
        else {
            return null
        }
    }

    constructor(playerName?: string, basePath?: string, dbPath?: string, lrcPath?: string) {
        this.playerName = playerName || "iTunes"
        try {
            this.basePath = basePath || path.join(USER_HOME, 'Music', 'LyricsV')
            this.lrcPath = lrcPath || path.join(this.basePath, 'LRC', playerName)
            if (!fs.existsSync(this.basePath))
                fs.mkdirSync(this.basePath, { recursive: true })
            if (!fs.existsSync(this.lrcPath))
                fs.mkdirSync(this.lrcPath, { recursive: true })
            this.dbPath = dbPath || path.join(this.basePath, 'LyricsV.' + playerName + '.db')
            if (!path.isAbsolute(this.dbPath))
                this.dbPath = path.join(this.basePath, this.dbPath)

            const options: ConnectionOptions = {
                type: "sqlite",
                database: this.dbPath,
                entities: [ Track ],
                logging: false,
                migrationsRun: true
            }
            ;(async () => {
                this.connection = await createConnection(options)
                await this.connection.synchronize()
                this.trackRepository = this.connection.getRepository(Track)
                this.ready = true
            })()

        } catch(e) {
            this.noPersistence = true
            logger("Persistence constructor: no persistence due to" + e.stack)
        }
    }
    
}