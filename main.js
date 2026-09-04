// ============================================================
// DYNAMIC ARTIST POOL
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
// PLAYER VARIABLES
// ============================================================

let currentTrackList = [];
let currentTrackIndex = 0;
let currentTrack = null;

let playlists = {};


// HTML AUDIO PLAYER
const audio = document.getElementById("audioPlayer");


// ============================================================
// INITIAL LOAD
// ============================================================

window.onload = async () => {

    setVolume(80);

    await loadHomeOrbitDynamic();

};


// ============================================================
// HOME ORBIT
// ============================================================

async function loadHomeOrbitDynamic() {

    const orbit =
        document.getElementById("orbitRing");

    orbit.innerHTML =
        '<div style="color:var(--text-muted)">Loading...</div>';


    // Randomize artists
    const shuffled =
        [...artistPool].sort(
            () => 0.5 - Math.random()
        );


    // Select 8 random artists
    const selectedArtists =
        shuffled.slice(0, 8);


    let dynamicTracks = [];


    // Get songs
    for (const artist of selectedArtists) {

        try {

            const res =
                await fetch(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(
                        artist
                    )}&entity=song&limit=10`
                );


            const data =
                await res.json();


            // Only songs with playable preview
            const playable =
                data.results.filter(
                    item => item.previewUrl
                );


            if (playable.length > 0) {

                // Pick random song
                const item =
                    playable[
                        Math.floor(
                            Math.random() *
                            playable.length
                        )
                    ];


                dynamicTracks.push({

                    title: item.trackName,

                    artist: item.artistName,

                    album:
                        item.collectionName,

                    cover:
                        item.artworkUrl100.replace(
                            "100x100bb",
                            "400x400bb"
                        ),

                    duration:
                        formatMs(
                            item.trackTimeMillis ||
                            210000
                        ),

                    previewUrl:
                        item.previewUrl

                });

            }

        } catch (error) {

            console.error(
                "Home loading error:",
                error
            );

        }

    }


    currentTrackList =
        dynamicTracks;


    renderOrbit(dynamicTracks);

}


// ============================================================
// RENDER ORBIT
// ============================================================

function renderOrbit(tracks) {

    const orbit =
        document.getElementById("orbitRing");


    orbit.innerHTML = "";


    const total =
        tracks.length;


    if (total === 0) {

        orbit.innerHTML =
            '<div style="color:var(--text-muted)">No songs available.</div>';

        return;

    }


    const rx = 300;
    const ry = 170;


    tracks.forEach(
        (track, i) => {

            const angle =
                (i / total) *
                (2 * Math.PI);


            const x =
                rx * Math.cos(angle);


            const y =
                ry * Math.sin(angle);


            const card =
                document.createElement("div");


            card.className =
                "album-card";


            card.style.backgroundImage =
                `url('${track.cover}')`;


            card.style.transform =
                `translate(${x}px, ${y}px)
                 rotate(${
                    -angle *
                    (180 / Math.PI) +
                    90
                 }deg)`;


            card.innerHTML = `

                <div class="play-overlay">

                    <span>&#9654;</span>

                    <span>
                        ${track.duration}
                    </span>

                </div>

            `;


            card.onclick = () => {

                playTrack(
                    track,
                    tracks,
                    i
                );

            };


            orbit.appendChild(card);

        }
    );

}


// ============================================================
// PLAY TRACK
// ============================================================

function playTrack(
    track,
    list,
    index
) {

    if (!track) return;


    currentTrack =
        track;


    if (list) {

        currentTrackList =
            list;

    }


    if (index !== undefined) {

        currentTrackIndex =
            index;

    }


    // Update player information
    document.getElementById(
        "playerTrackImg"
    ).src = track.cover;


    document.getElementById(
        "playerTrackTitle"
    ).innerText = track.title;


    document.getElementById(
        "playerTrackArtist"
    ).innerText = track.artist;


    document.getElementById(
        "playerTrackAlbum"
    ).innerText =
        track.album || "Single";


    // Check if preview exists
    if (!track.previewUrl) {

        alert(
            "Sorry, this song does not have an available preview."
        );

        return;

    }


    // Stop current song
    audio.pause();


    // Load new audio
    audio.src =
        track.previewUrl;


    // Reset progress
    audio.currentTime = 0;


    document.getElementById(
        "progressBar"
    ).value = 0;


    document.getElementById(
        "currentTime"
    ).innerText = "0:00";


    // Play
    audio.play()
        .then(() => {

            document.getElementById(
                "mainPlayBtn"
            ).innerHTML =
                "&#10074;&#10074;";

        })
        .catch(error => {

            console.error(
                "Audio playback error:",
                error
            );

        });

}


// ============================================================
// PLAY / PAUSE
// ============================================================

function togglePlay() {

    if (!currentTrack) {

        return;

    }


    if (!audio.src) {

        playTrack(
            currentTrack,
            currentTrackList,
            currentTrackIndex
        );

        return;

    }


    if (audio.paused) {

        audio.play();

        document.getElementById(
            "mainPlayBtn"
        ).innerHTML =
            "&#10074;&#10074;";

    } else {

        audio.pause();

        document.getElementById(
            "mainPlayBtn"
        ).innerHTML =
            "&#9654;";

    }

}


// ============================================================
// NEXT TRACK
// ============================================================

function nextTrack() {

    if (
        currentTrackList.length === 0
    ) {

        return;

    }


    currentTrackIndex =
        (
            currentTrackIndex + 1
        ) %
        currentTrackList.length;


    playTrack(
        currentTrackList[
            currentTrackIndex
        ],
        currentTrackList,
        currentTrackIndex
    );

}


// ============================================================
// PREVIOUS TRACK
// ============================================================

function prevTrack() {

    if (
        currentTrackList.length === 0
    ) {

        return;

    }


    currentTrackIndex =
        (
            currentTrackIndex -
            1 +
            currentTrackList.length
        ) %
        currentTrackList.length;


    playTrack(
        currentTrackList[
            currentTrackIndex
        ],
        currentTrackList,
        currentTrackIndex
    );

}


// ============================================================
// AUDIO EVENTS
// ============================================================

// Update progress
audio.addEventListener(
    "timeupdate",
    () => {

        if (
            !audio.duration ||
            isNaN(audio.duration)
        ) {

            return;

        }


        const percentage =
            (
                audio.currentTime /
                audio.duration
            ) *
            100;


        document.getElementById(
            "progressBar"
        ).value =
            percentage;


        document.getElementById(
            "currentTime"
        ).innerText =
            formatSeconds(
                audio.currentTime
            );


        document.getElementById(
            "durationTime"
        ).innerText =
            formatSeconds(
                audio.duration
            );

    }
);


// When audio metadata loads
audio.addEventListener(
    "loadedmetadata",
    () => {

        document.getElementById(
            "durationTime"
        ).innerText =
            formatSeconds(
                audio.duration
            );

    }
);


// When song ends
audio.addEventListener(
    "ended",
    () => {

        nextTrack();

    }
);


// When paused
audio.addEventListener(
    "pause",
    () => {

        document.getElementById(
            "mainPlayBtn"
        ).innerHTML =
            "&#9654;";

    }
);


// When playing
audio.addEventListener(
    "play",
    () => {

        document.getElementById(
            "mainPlayBtn"
        ).innerHTML =
            "&#10074;&#10074;";

    }
);


// ============================================================
// SEEK
// ============================================================

function seekTrack(value) {

    if (
        !audio.duration ||
        isNaN(audio.duration)
    ) {

        return;

    }


    audio.currentTime =
        (
            Number(value) /
            100
        ) *
        audio.duration;

}


// ============================================================
// VOLUME
// ============================================================

function setVolume(value) {

    audio.volume =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) / 100
            )
        );

}


// ============================================================
// SEARCH
// ============================================================

async function handleSearch(query) {

    const resultsContainer =
        document.getElementById(
            "searchResults"
        );


    if (!query.trim()) {

        resultsContainer.classList.remove(
            "active"
        );

        resultsContainer.innerHTML =
            "";

        return;

    }


    try {

        const res =
            await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(
                    query
                )}&entity=song&limit=8`
            );


        const data =
            await res.json();


        resultsContainer.innerHTML =
            "";


        const searchTracks =
            data.results.filter(
                item =>
                    item.previewUrl
            );


        searchTracks.forEach(
            (item, index) => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "search-item";


                div.innerHTML = `

                    <div class="media-title">
                        ${item.trackName}
                    </div>

                    <div class="media-subtitle">
                        ${item.artistName}
                    </div>

                    <div class="search-item-type">
                        Song
                    </div>

                `;


                div.onclick = () => {

                    const track = {

                        title:
                            item.trackName,

                        artist:
                            item.artistName,

                        album:
                            item.collectionName,

                        cover:
                            item.artworkUrl100.replace(
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


                    playTrack(
                        track,
                        searchTracks.map(
                            searchItem => ({

                                title:
                                    searchItem.trackName,

                                artist:
                                    searchItem.artistName,

                                album:
                                    searchItem.collectionName,

                                cover:
                                    searchItem.artworkUrl100.replace(
                                        "100x100bb",
                                        "400x400bb"
                                    ),

                                duration:
                                    formatMs(
                                        searchItem.trackTimeMillis ||
                                        200000
                                    ),

                                previewUrl:
                                    searchItem.previewUrl

                            })
                        ),
                        index
                    );


                    resultsContainer.classList.remove(
                        "active"
                    );

                };


                resultsContainer.appendChild(
                    div
                );

            }
        );


        if (searchTracks.length > 0) {

            resultsContainer.classList.add(
                "active"
            );

        } else {

            resultsContainer.innerHTML = `

                <div
                    class="search-item"
                    style="color:var(--text-muted)"
                >
                    No playable songs found.
                </div>

            `;

            resultsContainer.classList.add(
                "active"
            );

        }

    } catch (error) {

        console.error(
            "Search error:",
            error
        );

    }

}


// ============================================================
// CLEAR SEARCH
// ============================================================

function clearSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    const results =
        document.getElementById(
            "searchResults"
        );


    input.value = "";


    results.innerHTML = "";


    results.classList.remove(
        "active"
    );


    input.focus();

}


// ============================================================
// PLAYER ARTIST
// ============================================================

async function onPlayerArtistClick() {

    if (!currentTrack) {

        return;

    }


    showArtistTopHits(
        currentTrack.artist
    );

}


// ============================================================
// PLAYER ALBUM
// ============================================================

async function onPlayerAlbumClick() {

    if (!currentTrack) {

        return;

    }


    showAlbumTracks(
        currentTrack.album,
        currentTrack.artist
    );

}


// ============================================================
// ARTIST TOP HITS
// ============================================================

async function showArtistTopHits(
    artist
) {

    const modal =
        document.getElementById(
            "detailModal"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    modal.classList.add(
        "active"
    );


    body.innerHTML = `

        <div
            style="color:var(--text-muted)"
        >
            Loading Top Hits for
            ${artist}...
        </div>

    `;


    try {

        const res =
            await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(
                    artist
                )}&entity=song&limit=8`
            );


        const data =
            await res.json();


        let html = `

            <div class="section-title">
                Top Hits — ${artist}
            </div>

        `;


        const tracks =
            data.results.filter(
                t => t.previewUrl
            );


        tracks.forEach(
            (t, idx) => {

                html += `

                    <div
                        class="track-row"
                        data-track-index="${idx}"
                    >

                        <div>

                            <div class="media-title">

                                ${idx + 1}.
                                ${t.trackName}

                            </div>

                            <div class="media-subtitle">

                                ${t.collectionName}

                            </div>

                        </div>

                        <div>

                            ${formatMs(
                                t.trackTimeMillis
                            )}

                        </div>

                    </div>

                `;

            }
        );


        body.innerHTML =
            html;


        body.querySelectorAll(
            ".track-row"
        ).forEach(
            (row, index) => {

                row.onclick = () => {

                    const t =
                        tracks[index];


                    playTrack({

                        title:
                            t.trackName,

                        artist:
                            t.artistName,

                        album:
                            t.collectionName,

                        cover:
                            t.artworkUrl100.replace(
                                "100x100bb",
                                "400x400bb"
                            ),

                        duration:
                            formatMs(
                                t.trackTimeMillis
                            ),

                        previewUrl:
                            t.previewUrl

                    }, tracks.map(
                        item => ({

                            title:
                                item.trackName,

                            artist:
                                item.artistName,

                            album:
                                item.collectionName,

                            cover:
                                item.artworkUrl100.replace(
                                    "100x100bb",
                                    "400x400bb"
                                ),

                            duration:
                                formatMs(
                                    item.trackTimeMillis
                                ),

                            previewUrl:
                                item.previewUrl

                        })
                    ), index);

                };

            }
        );

    } catch (error) {

        body.innerHTML = `

            <div
                style="color:var(--text-muted)"
            >
                Unable to load songs.
            </div>

        `;

    }

}


// ============================================================
// ALBUM TRACKS
// ============================================================

async function showAlbumTracks(
    album,
    artist
) {

    const modal =
        document.getElementById(
            "detailModal"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    modal.classList.add(
        "active"
    );


    body.innerHTML = `

        <div
            style="color:var(--text-muted)"
        >
            Loading Album tracks...
        </div>

    `;


    try {

        const res =
            await fetch(
                `https://itunes.apple.com/search?term=${encodeURIComponent(
                    album + " " + artist
                )}&entity=song&limit=10`
            );


        const data =
            await res.json();


        const tracks =
            data.results.filter(
                t => t.previewUrl
            );


        let html = `

            <div class="section-title">
                Album Tracklist — ${album}
            </div>

        `;


        tracks.forEach(
            (t, idx) => {

                html += `

                    <div
                        class="track-row"
                        data-track-index="${idx}"
                    >

                        <div>

                            <div class="media-title">

                                ${idx + 1}.
                                ${t.trackName}

                            </div>

                            <div class="media-subtitle">

                                ${t.artistName}

                            </div>

                        </div>

                        <div>

                            ${formatMs(
                                t.trackTimeMillis
                            )}

                        </div>

                    </div>

                `;

            }
        );


        body.innerHTML =
            html;


        body.querySelectorAll(
            ".track-row"
        ).forEach(
            (row, index) => {

                row.onclick = () => {

                    const t =
                        tracks[index];


                    const list =
                        tracks.map(
                            item => ({

                                title:
                                    item.trackName,

                                artist:
                                    item.artistName,

                                album:
                                    item.collectionName,

                                cover:
                                    item.artworkUrl100.replace(
                                        "100x100bb",
                                        "400x400bb"
                                    ),

                                duration:
                                    formatMs(
                                        item.trackTimeMillis
                                    ),

                                previewUrl:
                                    item.previewUrl

                            })
                        );


                    playTrack(
                        list[index],
                        list,
                        index
                    );

                };

            }
        );

    } catch (error) {

        body.innerHTML = `

            <div
                style="color:var(--text-muted)"
            >
                Unable to load album tracks.
            </div>

        `;

    }

}


// ============================================================
// PLAYLIST MANAGEMENT
// ============================================================

function addCurrentToPlaylist() {

    if (!currentTrack) {

        alert(
            "Please play a song first!"
        );

        return;

    }


    const existingNames =
        Object.keys(playlists);


    let msg =
        "Enter Playlist Name:";


    if (existingNames.length > 0) {

        msg +=
            "\nExisting Playlists: " +
            existingNames.join(", ");

    }


    const plName =
        prompt(msg);


    if (plName) {

        if (!playlists[plName]) {

            playlists[plName] = [];

        }


        playlists[plName].push(
            currentTrack
        );


        alert(
            `Added "${currentTrack.title}" to "${plName}"`
        );


        renderPlaylistsView();

    }

}


// ============================================================
// CREATE PLAYLIST
// ============================================================

function createNewPlaylist() {

    const plName =
        prompt(
            "New Playlist Name:"
        );


    if (plName) {

        if (!playlists[plName]) {

            playlists[plName] = [];

        }


        renderPlaylistsView();

    }

}


// ============================================================
// RENDER PLAYLISTS
// ============================================================

function renderPlaylistsView() {

    const grid =
        document.getElementById(
            "playlistsGrid"
        );


    grid.innerHTML = "";


    const names =
        Object.keys(playlists);


    if (names.length === 0) {

        grid.innerHTML = `

            <div
                style="color:var(--text-muted);"
            >
                No playlists created yet.
                Click "+ Create Playlist" above!
            </div>

        `;

        return;

    }


    names.forEach(
        name => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "media-card";


            card.innerHTML = `

                <div class="media-title">
                    ${name}
                </div>

                <div class="media-subtitle">
                    ${playlists[name].length}
                    Songs
                </div>

            `;


            card.onclick = () => {

                openPlaylistDetails(
                    name
                );

            };


            grid.appendChild(
                card
            );

        }
    );

}


// ============================================================
// OPEN PLAYLIST
// ============================================================

function openPlaylistDetails(
    name
) {

    const modal =
        document.getElementById(
            "detailModal"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    modal.classList.add(
        "active"
    );


    let html = `

        <div class="section-title">
            Playlist: ${name}
        </div>

    `;


    playlists[name].forEach(
        (t, idx) => {

            html += `

                <div
                    class="track-row"
                    data-playlist-index="${idx}"
                >

                    <div>

                        <div class="media-title">

                            ${idx + 1}.
                            ${t.title}

                        </div>

                        <div class="media-subtitle">

                            ${t.artist}

                        </div>

                    </div>

                    <div>
                        ${t.duration}
                    </div>

                </div>

            `;

        }
    );


    body.innerHTML =
        html;


    body.querySelectorAll(
        ".track-row"
    ).forEach(
        (row, index) => {

            row.onclick = () => {

                playTrack(
                    playlists[name][index],
                    playlists[name],
                    index
                );

            };

        }
    );

}


// ============================================================
// TOP HITS
// ============================================================

async function loadBillboardHits() {

    const grid =
        document.getElementById(
            "billboardGrid"
        );


    grid.innerHTML = `

        <div
            style="color:var(--text-muted)"
        >
            Loading Billboard Hits...
        </div>

    `;


    // Random artists
    const shuffled =
        [...artistPool].sort(
            () => 0.5 - Math.random()
        );


    const selectedArtists =
        shuffled.slice(0, 10);


    let hits = [];


    for (
        const artist
        of selectedArtists
    ) {

        try {

            const res =
                await fetch(
                    `https://itunes.apple.com/search?term=${encodeURIComponent(
                        artist
                    )}&entity=song&limit=10`
                );


            const data =
                await res.json();


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


                hits.push({

                    title:
                        item.trackName,

                    artist:
                        item.artistName,

                    album:
                        item.collectionName,

                    cover:
                        item.artworkUrl100.replace(
                            "100x100bb",
                            "400x400bb"
                        ),

                    duration:
                        formatMs(
                            item.trackTimeMillis ||
                            210000
                        ),

                    previewUrl:
                        item.previewUrl

                });

            }

        } catch (error) {

            console.error(
                "Top Hits error:",
                error
            );

        }

    }


    currentTrackList =
        hits;


    grid.innerHTML = "";


    hits.forEach(
        (track, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "media-card";


            card.innerHTML = `

                <div class="image-wrapper">

                    <img
                        src="${track.cover}"
                        alt="Art"
                    >

                    <div class="play-overlay">

                        <span>
                            &#9654;
                        </span>

                        <span>
                            ${track.duration}
                        </span>

                    </div>

                </div>

                <div class="media-title">
                    ${track.title}
                </div>

                <div class="media-subtitle">
                    ${track.artist}
                </div>

            `;


            card.onclick = () => {

                playTrack(
                    track,
                    hits,
                    index
                );

            };


            grid.appendChild(
                card
            );

        }
    );

}


// ============================================================
// TAB CONTROL
// ============================================================

async function switchTab(tab) {

    document
        .querySelectorAll("nav a")
        .forEach(
            a =>
                a.classList.remove(
                    "active"
                )
        );


    document
        .querySelectorAll(".view-section")
        .forEach(
            v =>
                v.classList.remove(
                    "active"
                )
        );


    // HOME
    if (tab === "home") {

        document
            .getElementById(
                "nav-home"
            )
            .classList.add(
                "active"
            );


        document
            .getElementById(
                "view-home"
            )
            .classList.add(
                "active"
            );


        // Reload Home EVERY TIME
        await loadHomeOrbitDynamic();

    }


    // TOP HITS
    else if (tab === "hits") {

        document
            .getElementById(
                "nav-hits"
            )
            .classList.add(
                "active"
            );


        document
            .getElementById(
                "view-hits"
            )
            .classList.add(
                "active"
            );


        // Reload Top Hits EVERY TIME
        await loadBillboardHits();

    }


    // PLAYLISTS
    else if (
        tab === "playlists"
    ) {

        document
            .getElementById(
                "nav-playlists"
            )
            .classList.add(
                "active"
            );


        document
            .getElementById(
                "view-playlists"
            )
            .classList.add(
                "active"
            );


        renderPlaylistsView();

    }

}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeModal() {

    document
        .getElementById(
            "detailModal"
        )
        .classList.remove(
            "active"
        );

}


// ============================================================
// FORMAT MILLISECONDS
// ============================================================

function formatMs(ms) {

    const min =
        Math.floor(
            ms / 60000
        );


    const sec =
        Math.floor(
            (ms % 60000) / 1000
        );


    return `${min}:${
        sec < 10 ? "0" : ""
    }${sec}`;

}


// ============================================================
// FORMAT AUDIO SECONDS
// ============================================================

function formatSeconds(seconds) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const min =
        Math.floor(
            seconds / 60
        );


    const sec =
        Math.floor(
            seconds % 60
        );


    return `${min}:${
        sec < 10 ? "0" : ""
    }${sec}`;

}