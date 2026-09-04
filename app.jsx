import React, {
    useEffect,
    useRef,
    useState
} from "https://esm.sh/react@18.3.1";


// ============================================================
// ARTIST POOL
// ============================================================

const artistPool = [
    "The Weeknd",
    "Sabrina Carpenter",
    "Chappell Roan",
    "Ariana Grande",
    "Billie Eilish",
    "Taylor Swift",
    "Post Malone",
    "Kendrick Lamar",
    "Dua Lipa",
    "Drake",
    "Olivia Rodrigo",
    "SZA",
    "Bruno Mars",
    "Coldplay",
    "Harry Styles",
    "Doja Cat",
    "Travis Scott",
    "Lana Del Rey"
];


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatMs(ms) {

    const min =
        Math.floor(ms / 60000);

    const sec =
        Math.floor(
            (ms % 60000) / 1000
        );

    return `${min}:${sec < 10 ? "0" : ""}${sec}`;

}


function formatSeconds(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {
        return "0:00";
    }

    const min =
        Math.floor(seconds / 60);

    const sec =
        Math.floor(seconds % 60);

    return `${min}:${sec < 10 ? "0" : ""}${sec}`;

}


function convertTrack(item) {

    return {

        title:
            item.trackName,

        artist:
            item.artistName,

        album:
            item.collectionName,

        cover:
            item.artworkUrl100
                ?.replace(
                    "100x100bb",
                    "400x400bb"
                ),

        duration:
            formatMs(
                item.trackTimeMillis ||
                200000
            ),

        previewUrl:
            item.previewUrl

    };

}


// ============================================================
// APP
// ============================================================

export default function App() {

    // ========================================================
    // STATE
    // ========================================================

    const [activeTab, setActiveTab] =
        useState("home");


    const [homeTracks, setHomeTracks] =
        useState([]);


    const [hits, setHits] =
        useState([]);


    const [searchQuery, setSearchQuery] =
        useState("");


    const [searchResults, setSearchResults] =
        useState([]);


    const [searchActive, setSearchActive] =
        useState(false);


    const [currentTrack, setCurrentTrack] =
        useState(null);


    const [currentTrackList, setCurrentTrackList] =
        useState([]);


    const [currentTrackIndex, setCurrentTrackIndex] =
        useState(0);


    const [isPlaying, setIsPlaying] =
        useState(false);


    const [currentTime, setCurrentTime] =
        useState(0);


    const [duration, setDuration] =
        useState(0);


    const [volume, setVolume] =
        useState(80);


    const [playlists, setPlaylists] =
        useState({});


    const [modal, setModal] =
        useState(null);


    const audioRef =
        useRef(null);


    // ========================================================
    // INITIAL HOME LOAD
    // ========================================================

    useEffect(() => {

        loadHomeOrbitDynamic();

    }, []);


    // ========================================================
    // AUDIO EVENTS
    // ========================================================

    useEffect(() => {

        const audio =
            audioRef.current;

        if (!audio) return;


        const updateTime = () => {

            setCurrentTime(
                audio.currentTime
            );

        };


        const loadedMetadata = () => {

            setDuration(
                audio.duration
            );

        };


        const ended = () => {

            playNext();

        };


        const play = () => {

            setIsPlaying(true);

        };


        const pause = () => {

            setIsPlaying(false);

        };


        audio.addEventListener(
            "timeupdate",
            updateTime
        );

        audio.addEventListener(
            "loadedmetadata",
            loadedMetadata
        );

        audio.addEventListener(
            "ended",
            ended
        );

        audio.addEventListener(
            "play",
            play
        );

        audio.addEventListener(
            "pause",
            pause
        );


        return () => {

            audio.removeEventListener(
                "timeupdate",
                updateTime
            );

            audio.removeEventListener(
                "loadedmetadata",
                loadedMetadata
            );

            audio.removeEventListener(
                "ended",
                ended
            );

            audio.removeEventListener(
                "play",
                play
            );

            audio.removeEventListener(
                "pause",
                pause
            );

        };

    }, [
        currentTrackList,
        currentTrackIndex
    ]);


    // ========================================================
    // VOLUME
    // ========================================================

    useEffect(() => {

        if (audioRef.current) {

            audioRef.current.volume =
                volume / 100;

        }

    }, [volume]);


    // ========================================================
    // HOME
    // ========================================================

    async function loadHomeOrbitDynamic() {

        const shuffled =
            [...artistPool].sort(
                () => 0.5 - Math.random()
            );


        const selectedArtists =
            shuffled.slice(0, 8);


        let tracks = [];


        for (
            const artist
            of selectedArtists
        ) {

            try {

                const response =
                    await fetch(
                        `https://itunes.apple.com/search?term=${encodeURIComponent(
                            artist
                        )}&entity=song&limit=10`
                    );


                const data =
                    await response.json();


                const playable =
                    data.results.filter(
                        item =>
                            item.previewUrl
                    );


                if (
                    playable.length > 0
                ) {

                    const item =
                        playable[
                            Math.floor(
                                Math.random() *
                                playable.length
                            )
                        ];


                    tracks.push(
                        convertTrack(item)
                    );

                }

            } catch (error) {

                console.error(
                    "Home error:",
                    error
                );

            }

        }


        setHomeTracks(
            tracks
        );

    }


    // ========================================================
    // TOP HITS
    // ========================================================

    async function loadBillboardHits() {

        const shuffled =
            [...artistPool].sort(
                () => 0.5 - Math.random()
            );


        const selectedArtists =
            shuffled.slice(0, 10);


        let tracks = [];


        for (
            const artist
            of selectedArtists
        ) {

            try {

                const response =
                    await fetch(
                        `https://itunes.apple.com/search?term=${encodeURIComponent(
                            artist
                        )}&entity=song&limit=10`
                    );


                const data =
                    await response.json();


                const playable =
                    data.results.filter(
                        item =>
                            item.previewUrl
                    );


                if (
                    playable.length > 0
                ) {

                    const item =
                        playable[
                            Math.floor(
                                Math.random() *
                                playable.length
                            )
                        ];


                    tracks.push(
                        convertTrack(item)
                    );

                }

            } catch (error) {

                console.error(
                    "Top Hits error:",
                    error
                );

            }

        }


        setHits(
            tracks
        );

    }


    // ========================================================
    // PLAY TRACK
    // ========================================================

    function playTrack(
        track,
        list = [],
        index = 0
    ) {

        if (!track) return;


        if (!track.previewUrl) {

            alert(
                "Sorry, this song does not have an available preview."
            );

            return;

        }


        const audio =
            audioRef.current;


        if (!audio) return;


        setCurrentTrack(
            track
        );


        setCurrentTrackList(
            list.length > 0
                ? list
                : [track]
        );


        setCurrentTrackIndex(
            index
        );


        audio.pause();


        audio.src =
            track.previewUrl;


        audio.currentTime =
            0;


        audio.play()
            .catch(error => {

                console.error(
                    "Playback error:",
                    error
                );

            });

    }


    // ========================================================
    // PLAY / PAUSE
    // ========================================================

    function togglePlay() {

        const audio =
            audioRef.current;


        if (!currentTrack) {

            return;

        }


        if (
            audio.paused
        ) {

            audio.play();

        } else {

            audio.pause();

        }

    }


    // ========================================================
    // NEXT
    // ========================================================

    function playNext() {

        if (
            currentTrackList.length === 0
        ) {

            return;

        }


        const nextIndex =
            (
                currentTrackIndex + 1
            ) %
            currentTrackList.length;


        playTrack(
            currentTrackList[nextIndex],
            currentTrackList,
            nextIndex
        );

    }


    // ========================================================
    // PREVIOUS
    // ========================================================

    function playPrevious() {

        if (
            currentTrackList.length === 0
        ) {

            return;

        }


        const previousIndex =
            (
                currentTrackIndex -
                1 +
                currentTrackList.length
            ) %
            currentTrackList.length;


        playTrack(
            currentTrackList[
                previousIndex
            ],
            currentTrackList,
            previousIndex
        );

    }


    // ========================================================
    // SEARCH
    // ========================================================

    async function handleSearch(
        value
    ) {

        setSearchQuery(
            value
        );


        if (!value.trim()) {

            setSearchResults([]);

            setSearchActive(false);

            return;

        }


        try {

            const response =
                await fetch(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(
                        value
                    )}&entity=song&limit=8`
                );


            const data =
                await response.json();


            const playable =
                data.results.filter(
                    item =>
                        item.previewUrl
                );


            setSearchResults(
                playable.map(
                    convertTrack
                )
            );


            setSearchActive(
                true
            );

        } catch (error) {

            console.error(
                "Search error:",
                error
            );

        }

    }


    // ========================================================
    // CLEAR SEARCH
    // ========================================================

    function clearSearch() {

        setSearchQuery("");

        setSearchResults([]);

        setSearchActive(false);

    }


    // ========================================================
    // TAB SWITCH
    // ========================================================

    async function switchTab(
        tab
    ) {

        setActiveTab(
            tab
        );


        setSearchActive(
            false
        );


        if (
            tab === "home"
        ) {

            await loadHomeOrbitDynamic();

        }


        if (
            tab === "hits"
        ) {

            await loadBillboardHits();

        }

    }


    // ========================================================
    // CREATE PLAYLIST
    // ========================================================

    function createNewPlaylist() {

        const name =
            prompt(
                "New Playlist Name:"
            );


        if (!name) return;


        setPlaylists(
            previous => ({

                ...previous,

                [name]:
                    previous[name] ||
                    []

            })
        );

    }


    // ========================================================
    // ADD CURRENT TO PLAYLIST
    // ========================================================

    function addCurrentToPlaylist() {

        if (!currentTrack) {

            alert(
                "Please play a song first!"
            );

            return;

        }


        const name =
            prompt(
                "Enter Playlist Name:"
            );


        if (!name) return;


        setPlaylists(
            previous => ({

                ...previous,

                [name]: [
                    ...(previous[name] || []),
                    currentTrack
                ]

            })
        );


        alert(
            `"${currentTrack.title}" added to "${name}"`
        );

    }


    // ========================================================
    // ARTIST MODAL
    // ========================================================

    async function showArtistTopHits(
        artist
    ) {

        try {

            const response =
                await fetch(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(
                        artist
                    )}&entity=song&limit=8`
                );


            const data =
                await response.json();


            const tracks =
                data.results
                    .filter(
                        item =>
                            item.previewUrl
                    )
                    .map(
                        convertTrack
                    );


            setModal({

                type:
                    "artist",

                title:
                    `Top Hits — ${artist}`,

                tracks

            });

        } catch (error) {

            console.error(
                error
            );

        }

    }


    // ========================================================
    // ALBUM MODAL
    // ========================================================

    async function showAlbumTracks(
        album,
        artist
    ) {

        try {

            const response =
                await fetch(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(
                        album + " " + artist
                    )}&entity=song&limit=10`
                );


            const data =
                await response.json();


            const tracks =
                data.results
                    .filter(
                        item =>
                            item.previewUrl
                    )
                    .map(
                        convertTrack
                    );


            setModal({

                type:
                    "album",

                title:
                    `Album Tracklist — ${album}`,

                tracks

            });

        } catch (error) {

            console.error(
                error
            );

        }

    }


    // ========================================================
    // CURRENT PROGRESS
    // ========================================================

    const progress =
        duration > 0
            ? (
                currentTime /
                duration
            ) * 100
            : 0;


    function seekTrack(
        value
    ) {

        if (
            !audioRef.current ||
            !duration
        ) {

            return;

        }


        audioRef.current.currentTime =
            (
                Number(value) /
                100
            ) *
            duration;

    }


    // ========================================================
    // RETURN
    // ========================================================

    return (

        <>

            {/* ================================================
                HEADER
            ================================================= */}

            <header>

                <div className="logo">
                    BDplay
                </div>


                <div className="nav-center">

                    {/* SEARCH */}

                    <div className="search-box">

                        <span className="search-icon">
                            &#128269;
                        </span>


                        <input
                            type="text"
                            value={searchQuery}
                            placeholder="Search song or artist..."
                            onChange={
                                e =>
                                    handleSearch(
                                        e.target.value
                                    )
                            }
                        />


                        <button
                            className="clear-search"
                            onClick={
                                clearSearch
                            }
                            type="button"
                        >
                            &times;
                        </button>


                        {searchActive && (

                            <div className="search-results active">

                                {searchResults.length > 0 ? (

                                    searchResults.map(
                                        (track, index) => (

                                            <div
                                                className="search-item"
                                                key={
                                                    `${track.title}-${index}`
                                                }
                                                onClick={() => {

                                                    playTrack(
                                                        track,
                                                        searchResults,
                                                        index
                                                    );

                                                    setSearchActive(
                                                        false
                                                    );

                                                }}
                                            >

                                                <div className="media-title">

                                                    {track.title}

                                                </div>


                                                <div className="media-subtitle">

                                                    {track.artist}

                                                </div>


                                                <div className="search-item-type">

                                                    Song

                                                </div>

                                            </div>

                                        )
                                    )

                                ) : (

                                    <div className="search-item">

                                        <div
                                            className="media-subtitle"
                                        >
                                            No playable songs found.
                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>


                    {/* NAVIGATION */}

                    <nav>

                        <a
                            className={
                                activeTab === "home"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchTab("home")
                            }
                        >
                            Home
                        </a>


                        <a
                            className={
                                activeTab === "hits"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchTab("hits")
                            }
                        >
                            Top Hits
                        </a>


                        <a
                            className={
                                activeTab === "playlists"
                                    ? "active"
                                    : ""
                            }
                            onClick={() =>
                                switchTab(
                                    "playlists"
                                )
                            }
                        >
                            Playlists
                        </a>

                    </nav>

                </div>

            </header>


            {/* ================================================
                HOME
            ================================================= */}

            {activeTab === "home" && (

                <div className="view-section active">

                    <main>

                        <svg
                            className="center-glyph"
                            viewBox="0 0 100 100"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >

                            <ellipse
                                cx="50"
                                cy="50"
                                rx="40"
                                ry="15"
                            />

                            <ellipse
                                cx="50"
                                cy="50"
                                rx="30"
                                ry="25"
                            />

                            <circle
                                cx="50"
                                cy="50"
                                r="8"
                                fill="currentColor"
                            />

                        </svg>


                        <div className="orbit-container">

                            {homeTracks.map(
                                (track, index) => {

                                    const angle =
                                        (
                                            index /
                                            homeTracks.length
                                        ) *
                                        (
                                            2 *
                                            Math.PI
                                        );


                                    const x =
                                        300 *
                                        Math.cos(
                                            angle
                                        );


                                    const y =
                                        170 *
                                        Math.sin(
                                            angle
                                        );


                                    return (

                                        <div
                                            className="album-card"
                                            key={
                                                `${track.title}-${index}`
                                            }
                                            style={{
                                                backgroundImage:
                                                    `url('${track.cover}')`,
                                                transform:
                                                    `translate(${x}px, ${y}px)
                                                     rotate(${
                                                        -angle *
                                                        (180 / Math.PI) +
                                                        90
                                                     }deg)`
                                            }}
                                            onClick={() =>
                                                playTrack(
                                                    track,
                                                    homeTracks,
                                                    index
                                                )
                                            }
                                        >

                                            <div className="play-overlay">

                                                <span>
                                                    &#9654;
                                                </span>

                                                <span>
                                                    {track.duration}
                                                </span>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </main>

                </div>

            )}


            {/* ================================================
                TOP HITS
            ================================================= */}

            {activeTab === "hits" && (

                <div className="view-section active">

                    <div className="grid-container">

                        <div className="section-title">

                            Billboard Global Top Hits

                        </div>


                        <div className="media-grid">

                            {hits.map(
                                (track, index) => (

                                    <div
                                        className="media-card"
                                        key={
                                            `${track.title}-${index}`
                                        }
                                        onClick={() =>
                                            playTrack(
                                                track,
                                                hits,
                                                index
                                            )
                                        }
                                    >

                                        <div className="image-wrapper">

                                            <img
                                                src={track.cover}
                                                alt="Art"
                                            />


                                            <div className="play-overlay">

                                                <span>
                                                    &#9654;
                                                </span>

                                                <span>
                                                    {track.duration}
                                                </span>

                                            </div>

                                        </div>


                                        <div className="media-title">

                                            {track.title}

                                        </div>


                                        <div className="media-subtitle">

                                            {track.artist}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================
                PLAYLISTS
            ================================================= */}

            {activeTab === "playlists" && (

                <div className="view-section active">

                    <div className="grid-container">

                        <div className="section-title-row">

                            <div className="section-title">

                                Your Playlists

                            </div>


                            <button
                                className="action-btn"
                                onClick={
                                    createNewPlaylist
                                }
                            >
                                + Create Playlist
                            </button>

                        </div>


                        <div className="media-grid">

                            {Object.keys(
                                playlists
                            ).length === 0 ? (

                                <div
                                    style={{
                                        color:
                                            "var(--text-muted)"
                                    }}
                                >
                                    No playlists created yet.
                                    Click "+ Create Playlist"
                                    above!
                                </div>

                            ) : (

                                Object.keys(
                                    playlists
                                ).map(
                                    name => (

                                        <div
                                            className="media-card"
                                            key={name}
                                            onClick={() =>
                                                setModal({

                                                    type:
                                                        "playlist",

                                                    title:
                                                        `Playlist: ${name}`,

                                                    tracks:
                                                        playlists[name]

                                                })
                                            }
                                        >

                                            <div className="media-title">

                                                {name}

                                            </div>


                                            <div className="media-subtitle">

                                                {
                                                    playlists[
                                                        name
                                                    ].length
                                                }
                                                {" "}
                                                Songs

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>

                </div>

            )}


            {/* ================================================
                MODAL
            ================================================= */}

            {modal && (

                <div className="modal-overlay active">

                    <div className="modal-content">

                        <div className="modal-header-nav">

                            <button
                                className="back-btn"
                                onClick={() =>
                                    setModal(null)
                                }
                            >
                                &#129144; Back
                            </button>

                        </div>


                        <div className="section-title">

                            {modal.title}

                        </div>


                        {modal.tracks.map(
                            (track, index) => (

                                <div
                                    className="track-row"
                                    key={
                                        `${track.title}-${index}`
                                    }
                                    onClick={() =>
                                        playTrack(
                                            track,
                                            modal.tracks,
                                            index
                                        )
                                    }
                                >

                                    <div>

                                        <div className="media-title">

                                            {index + 1}.
                                            {" "}
                                            {track.title}

                                        </div>


                                        <div className="media-subtitle">

                                            {track.artist}

                                        </div>

                                    </div>


                                    <div>

                                        {track.duration}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* ================================================
                PLAYER BAR
            ================================================= */}

            <div className="player-bar">

                {/* LEFT */}

                <div className="player-left">

                    <img
                        src={
                            currentTrack?.cover ||
                            "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&q=80"
                        }
                        alt="Cover"
                    />


                    <div>

                        <div className="player-title">

                            {currentTrack?.title ||
                                "Select a Track"}

                        </div>


                        <div className="player-subtitle">

                            <span
                                className="link-span"
                                onClick={() => {

                                    if (
                                        currentTrack
                                    ) {

                                        showArtistTopHits(
                                            currentTrack.artist
                                        );

                                    }

                                }}
                            >

                                {currentTrack?.artist ||
                                    "BDplay Player"}

                            </span>


                            {" • "}


                            <span
                                className="link-span"
                                onClick={() => {

                                    if (
                                        currentTrack
                                    ) {

                                        showAlbumTracks(
                                            currentTrack.album,
                                            currentTrack.artist
                                        );

                                    }

                                }}
                            >

                                {currentTrack?.album ||
                                    "Album"}

                            </span>

                        </div>

                    </div>

                </div>


                {/* CENTER */}

                <div className="player-center">

                    <div className="player-controls">

                        <button
                            onClick={
                                playPrevious
                            }
                            title="Previous"
                        >
                            &#10094;&#10094;
                        </button>


                        <button
                            className="play-btn"
                            onClick={
                                togglePlay
                            }
                        >

                            {isPlaying
                                ? "❚❚"
                                : "▶"}

                        </button>


                        <button
                            onClick={
                                playNext
                            }
                            title="Next"
                        >
                            &#10095;&#10095;
                        </button>


                        <button
                            className="add-playlist-btn"
                            onClick={
                                addCurrentToPlaylist
                            }
                            title="Add to Playlist"
                        >
                            + Playlist
                        </button>

                    </div>


                    <div className="progress-container">

                        <span>

                            {formatSeconds(
                                currentTime
                            )}

                        </span>


                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={
                                e =>
                                    seekTrack(
                                        e.target.value
                                    )
                            }
                        />


                        <span>

                            {formatSeconds(
                                duration
                            )}

                        </span>

                    </div>

                </div>


                {/* RIGHT */}

                <div className="player-right">

                    <span
                        style={{
                            fontSize:
                                "0.65rem",

                            color:
                                "var(--text-muted)"
                        }}
                    >
                        VOL
                    </span>


                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={
                            e =>
                                setVolume(
                                    Number(
                                        e.target.value
                                    )
                                )
                        }
                        style={{
                            width: "70px"
                        }}
                    />

                </div>

            </div>


            {/* AUDIO */}

            <audio
                ref={audioRef}
                preload="metadata"
            />

        </>

    );

}