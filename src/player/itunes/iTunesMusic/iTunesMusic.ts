import "process"

const getiTunesMusic = (platform: string) => {
    switch (platform) {
        case "win32":
            return require("./iTunesCOM/iTunesMusic").default
        case "darwin":
            return require("./iTunesOSA/iTunesMusic").default
        default:
            return class iTunesMusic { }
    }
}
export default getiTunesMusic(process.platform)