import { Entity, PrimaryColumn, Column } from "typeorm"

@Entity("Track")
export class Track {
    @PrimaryColumn()
    uid: string

    name: string

    artist: string

    album: string

    duration: number

    @Column({ nullable: true })
    location: string
    
    @Column({ nullable: true })
    lrcFile?: string

    @Column({ nullable: true })
    lrcOffset?: number

    @Column({ nullable: true })
    disabledLyric?: boolean

    clone = (): Track => {
        let ret = new Track()
        for (let key of Object.keys(this)) {
            ret[key] = this[key].clone()
        }
        return ret
    }
    public static clone(src: Track): Track {
        let ret = new Track()
        for (let key of Object.keys(src)) {
            ret[key] = src[key]
        }
        return ret
  }
}