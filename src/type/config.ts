export type Config = {
    player: string,
    useTranslation: boolean,
    integrateTranslation: boolean,
    useLyricsBeside: boolean,
    providers?: string[],
    debug?: boolean,
    verbose?: boolean,
    basePath?: string
}

export const defaultConfig: Config = {
    player: "iTunes",
    useTranslation: true,
    integrateTranslation: true,
    useLyricsBeside: true
}