export function escapeFilename(filename: string) {
    const invalidChars = '\\:*"<>|?'
    let data: string[] = []
    for (let ch of filename) {
        if (invalidChars.indexOf(ch) != -1)
            continue
        if (ch == '/')
            ch = '_'
        data.push(ch)
    }
    return filename
}