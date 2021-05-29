export function escapeFilename(filename: string) {
    const invalidChars = '\\:*"<>|?'
    let data: string[] = []
    for (let ch of filename) {
        if (invalidChars.indexOf(ch) != -1)
            continue
        data.push(ch)
    }
    return filename.replace('/', '_')
}