export enum ITPlayerState {
    ITPlayerStateStopped = 0,
    ITPlayerStatePlaying,
    ITPlayerStateFastForward,
    ITPlayerStateRewind
}

export enum ITVisualSize {
    ITVisualSizeSmall = 0,
    ITVisualSizeMedium,
    ITVisualSizeLarge
}

export enum ITCOMDisabledReason {
    ITCOMDisabledReasonOther = 0,
    ITCOMDisabledReasonDialog,
    ITCOMDisabledReasonQuitting
}

export enum ITPlayButtonState {
    ITPlayButtonStatePlayDisabled = 0,
    ITPlayButtonStatePlayEnabled,
    ITPlayButtonStatePauseEnabled,
    ITPlayButtonStatePauseDisabled,
    ITPlayButtonStateStopEnabled,
    ITPlayButtonStateStopDisabled
}

export enum ITPlayerButton {
    ITPlayerButtonPrevious = 0,
    ITPlayerButtonPlay,
    ITPlayerButtonNext
}

export enum ITPlayerButtonModifierKey {
    ITPlayerButtonModifierKeyNone = 0,
    ITPlayerButtonModifierKeyShift = 1,
    ITPlayerButtonModifierKeyControl = 2,
    ITPlayerButtonModifierKeyAlt = 4,
    ITPlayerButtonModifierKeyCapsLock = 8
}

export enum ITEvent {
    ITEventDatabaseChanged = 1,
    ITEventPlayerPlay = 2,
    ITEventPlayerStop = 3,
    ITEventPlayerPlayingTrackChanged = 4,
    ITEventCOMCallsDisabled = 6,
    ITEventCOMCallsEnabled = 7,
    ITEventQuitting = 8,
    ITEventAboutToPromptUserToQuit = 9,
    ITEventSoundVolumeChanged = 10
}

export enum ITConvertOperationStatusEvent {
    ITConvertOperationStatusChanged = 1,
    ITConvertOperationComplete = 2
}

export enum ITArtworkFormat {
    ITArtworkFormatUnknown = 0,
    ITArtworkFormatJPEG,
    ITArtworkFormatPNG,
    ITArtworkFormatBMP
}
export enum ITVersion {
    kITTypeLibrary_MajorVersion = 1,
    kITTypeLibrary_MinorVersion = 13
}
export enum ITErrors {
    ITUNES_E_USERCANCEL = 0xA0040201,
    ITUNES_E_OBJECTDELETED = 0xA0040202,
    ITUNES_E_OBJECTLOCKED = 0xA0040203,
    ITUNES_E_CONVERSIONINPROGRESS = 0xA0040204,
    ITUNES_E_MUSICSTOREDISABLED = 0xA0040205,
    ITUNES_E_OBJECTEXISTS = 0xA0040206,
    ITUNES_E_PODCASTSDISABLED = 0xA0040207
}
export enum ITPlaylistKind {
    ITPlaylistKindUnknown = 0,
    ITPlaylistKindLibrary,
    ITPlaylistKindUser,
    ITPlaylistKindCD,
    ITPlaylistKindDevice,
    ITPlaylistKindRadioTuner
}

export enum ITPlaylistRepeatMode {
    ITPlaylistRepeatModeOff = 0,
    ITPlaylistRepeatModeOne,
    ITPlaylistRepeatModeAll
}
export enum ITPlaylistPrintKind {
    ITPlaylistPrintKindPlaylist = 0,
    ITPlaylistPrintKindAlbumlist,
    ITPlaylistPrintKindInsert
}
export enum ITPlaylistSearchField {
    ITPlaylistSearchFieldAll = 0,
    ITPlaylistSearchFieldVisible,
    ITPlaylistSearchFieldArtists,
    ITPlaylistSearchFieldAlbums,
    ITPlaylistSearchFieldComposers,
    ITPlaylistSearchFieldSongNames
}
export enum ITUserPlaylistSpecialKind {
    ITUserPlaylistSpecialKindNone = 0,
    ITUserPlaylistSpecialKindPurchases,
    ITUserPlaylistSpecialKindITunesDJ,
    ITUserPlaylistSpecialKindPodcasts,
    ITUserPlaylistSpecialKindFolder,
    ITUserPlaylistSpecialKindVideos,
    ITUserPlaylistSpecialKindMusic,
    ITUserPlaylistSpecialKindMovies,
    ITUserPlaylistSpecialKindTVShows,
    ITUserPlaylistSpecialKindBooks,
    ITUserPlaylistSpecialKindITunesU,
    ITUserPlaylistSpecialKindGenius
}
export enum ITSourceKind {
    ITSourceKindUnknown = 0,
    ITSourceKindLibrary,
    ITSourceKindIPod,
    ITSourceKindAudioCD,
    ITSourceKindMP3CD,
    ITSourceKindDevice,
    ITSourceKindRadioTuner,
    ITSourceKindSharedLibrary
}
export enum ITTrackKind {
    ITTrackKindUnknown = 0,
    ITTrackKindFile,
    ITTrackKindCD,
    ITTrackKindURL,
    ITTrackKindDevice,
    ITTrackKindSharedLibrary
}

export enum ITVideoKind {
    ITVideoKindNone = 0,
    ITVideoKindMovie,
    ITVideoKindMusicVideo,
    ITVideoKindTVShow
}

export enum ITRatingKind {
    ITRatingKindUser = 0,
    ITRatingKindComputed
}
export enum ITWindowKind {
    ITWindowKindUnknown = 0,
    ITWindowKindBrowser,
    ITWindowKindPlaylist,
    ITWindowKindEQ,
    ITWindowKindArtwork,
    ITWindowKindNowPlaying
}