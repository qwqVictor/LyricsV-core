export function unwrapJSONP(jsonp: string) {
    jsonp = jsonp.substr(jsonp.indexOf('(') + 1)
    jsonp = jsonp.substr(0, jsonp.lastIndexOf(')'))
    return JSON.parse(jsonp)
}