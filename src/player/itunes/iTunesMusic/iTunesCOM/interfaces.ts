export interface ITObject {
    Name               : string
    Index              : number
    sourceID           : number
    playlistID         : number
    trackID            : number
    TrackDatabaseID    : number
}

export interface ITTrack extends ITObject {
    Kind               : number
    Playlist           : ITPlaylist
    Album              : string
    Artist             : string
    BitRate            : number
    BPM                : number
    Comment            : string
    Compilation        : boolean
    Composer           : string
    DateAdded          : Date
    DiscCount          : number
    DiscNumber         : number
    Duration           : number
    Enabled            : boolean
    EQ                 : string
    Finish             : number
    Genre              : string
    Grouping           : string
    KindAsString       : string
    ModificationDate   : Date
    PlayedCount        : number
    PlayedDate         : Date
    PlayOrderIndex     : number
    Rating             : number
    SampleRate         : number
    Size               : number
    Start              : number
    Time               : string
    TrackCount         : number
    TrackNumber        : number
    VolumeAdjustment   : number
    Year               : number
    Artwork            : ITArtwork
    Location           : string
    Podcast            : boolean
    RememberBookmark   : boolean
    ExcludeFromShuffle : boolean
    Lyrics             : string
    Category           : string
    Description        : string
    LongDescription    : string
    BookmarkTime       : number
    VideoKind          : number
    SkippedCount       : number
    SkippedDate        : Date
    PartOfGaplessAlbum : boolean
    AlbumArtist        : string
    Show               : string
    SeasonNumber       : number
    EpisodeID          : number
    EpisodeNumber      : number
    Size64High         : number
    Size64Low          : number
    Unplayed           : boolean
    SortAlbum          : string
    SortAlbumArtist    : string
    SortArtist         : string
    SortComposer       : string
    SortName           : string
    SortShow           : string
    AlbumRating        : number
    AlbumRatingKind    : number
    ratingKind         : number
    Playlists          : Array<ITPlaylist>
    ReleaseDate        : Date
}

export interface ITPlaylist extends ITObject {
    Kind            : number
    Source          : ITSource
    Duration        : number
    Shuffle         : boolean
    Size            : number
    SongRepeat      : number
    Time            : string
    Visible         : boolean
    Tracks          : Array<ITTrack>
    Shared          : boolean
    Smart           : boolean
    SpecialKind     : number
    Parent?         : ITObject
}

export interface ITSource extends ITObject {
    Kind            : number
    Capacity        : number
    FreeSpace       : number
    Playlists       : Array<ITPlaylist>
}

export interface ITArtwork {
    Format          : any
    IsDownloadedArtwork : boolean
    Description     : string
}