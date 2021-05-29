export function logger(...args: any[]) {
    if (global['DEBUG'])
        console.error(...args)
}

export function loggerVerbose(...args: any[]) {
    if (global['DEBUG'] && global['VERBOSE'])
        console.error(...args)
}