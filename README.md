# LyricsV-core

The core component of [LyricsV](https://lyricsv.app).

## Architecture

LyricsV uses IPC to communicate with the core. And inside the core, worker threads of different components use MessagePort to communicate with each other.

We encapsulated IPC and MessagePort into "events" inside the `JSONEventEmitter`. Now the event list is shown below.

### Events


| EventName | Parameters | EmittedBy | HandledBy | Comment |
| - | - | - | - | - |
| `trackChange` | `track: Track` | PlayerInterface | [all] |   |
| `togglePlayPause` | `isPlaying: boolean` | PlayerInterface | [all] |   |
| `timeUpdate` | `pos: number` | PlayerInterface | LyricsWorker | Real number in seconds, with milliseconds accuracy |
| `playerQuit` |   | PlayerInterface | [Parent] |   |
| `lyricChange` | `lyrics: Lyric[], offset: Number` | LyricsWorker | [Parent] |   |
| `lyricIndex` | `index: number` | LyricsWorker | [Parent] |   |
| `lyricPreviewIndex` | `index: number, previewTrackUID: string` | LyricsWorker | [Parent] |   |
| `updateConfig` | `config: Config` | [Parent] | [all] |   |
| `disableLyrics` | `trackUID: string` | [Parent] | LyricsWorker |   |
| `setLyrics` | `track: Track, lyricPassed: Lrc | string, offset?: number` | [Parent] | LyricsWorker |
| `setOffset` | `trackUID: string, offset: number` | [Parent] | LyricsWorker |   |
| `searchLyrics` | `transactionId: number, track: Track` | [Parent] | LyricsWorker |   |
| `lyricsSearchResult` | `transactionId: number, searchResults: LyricsSearchResult[]` | LyricsWorker | [Parent] |   |
| `getLyrics` | `transactionId: number, searchResult: LyricsSearchResult, track: Track, preview?: boolean` | [Parent] | LyricsWorker |   |
| `lyricsGot` | `transactionId: number, result: Lrc` | LyricsWorker | [Parent] |   |
| `cancelPreview` |   | [Parent] | LyricsWorker |   |

### Music Providers

LyricsV fetches lyrics from some music providers. Currently supported (most in China):

- [X] Netease Cloud Music
- [X] QQ Music
- [X] Kugou Music
- [X] Migu Music
- [X] Kuwo Music
- [X] Gecimi 歌词迷 (A standalone platform to redistribute lyrics only)

## To-dos

- [ ] iTunes and Music.app for macOS support
- [ ] System now playing support for Windows (via SMTC)
- [ ] System now playing support for macOS

## About

LyricsV-core is licensed under [Apache-2.0 Public License](LICENSE).

**Code with ♥ by Victor Huang <i@qwq.ren>**
