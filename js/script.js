// Initialize a global Audio object to handle the current song playback
let currentSong = new Audio();
let songs; // Array to hold the list of song names
let currFolder; // The name of the currently selected folder containing songs

/**
 * Converts a time duration from seconds to MM:SS format.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} - The formatted time string (e.g., "03:45").
 */
function secondsToMinutesSeconds(seconds) {
    // Return "00:00" for invalid or negative input
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Pad minutes and seconds with leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return the formatted time string
    return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * Fetches songs from a given folder and displays them in the UI.
 * @param {string} folder - The name of the folder containing songs.
 * @returns {Promise<Array<string>>} - A promise resolving to an array of song names.
 */
async function getSongs(folder) {
    currFolder = folder; // Store the current folder name
    let response = await (await fetch(`/${folder}/`)).text(); // Fetch the folder contents
    let div = document.createElement("div"); // Temporary div to parse the folder content
    div.innerHTML = response; // Set the HTML response into the div
    let links = div.getElementsByTagName("a"); // Get all anchor tags (song links)
    songs = []; // Reset the songs array

    // Loop through links to find song files ending in ".mp3"
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            // Extract the song name by removing the folder path
            songs.push(link.href.split(`/${folder}/`)[1]);
        }
    }

    // Select the playlist container in the UI
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear any existing list items

    // Add each song to the playlist as a list item
    for (const song of songs) {
        songUL.innerHTML += `<li>
            <img class="invert" width="34" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div> <!-- Replace encoded spaces -->
                <div>Harry</div> <!-- Placeholder artist name -->
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach click event listeners to each song in the playlist
    Array.from(songUL.getElementsByTagName("li")).forEach(item => {
        item.addEventListener("click", () => {
            // Play the clicked song using its displayed name
            playMusic(item.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });

    return songs; // Return the list of songs
}

/**
 * Plays or pauses the specified song.
 * @param {string} track - The name of the track to play.
 * @param {boolean} [pause=false] - Whether to pause the song instead of playing it.
 */
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track; // Set the song source to the track path
    if (!pause) {
        currentSong.play(); // Play the song
        play.src = "img/pause.svg"; // Update the play button icon to a pause icon
    }
    // Update the song information display
    document.querySelector(".songinfo").innerHTML = decodeURI(track); // Decode URI to display the track name
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"; // Reset the time display
};

/**
 * Fetches and displays a list of albums as clickable cards.
 */
async function displayAlbums() {
    let response = await (await fetch(`/songs/`)).text(); // Fetch the list of albums
    let div = document.createElement("div"); // Temporary div to parse the response
    div.innerHTML = response; // Set the HTML response into the div
    let anchors = div.getElementsByTagName("a"); // Get all anchor tags (album links)
    let cardContainer = document.querySelector(".cardContainer"); // Album container in the UI

    // Loop through album links to create album cards
    for (let anchor of anchors) {
        // Check if the link points to a valid album folder
        if (anchor.href.includes("/songs") && !anchor.href.includes(".htaccess")) {
            let folder = anchor.href.split("/").slice(-2)[0]; // Extract the folder name
            let metadata = await (await fetch(`/songs/${folder}/info.json`)).json(); // Fetch album metadata

            // Add the album card to the UI
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">          
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${metadata.title}</h2> <!-- Album title -->
                <p>${metadata.description}</p> <!-- Album description -->
            </div>`;
        }
    }

    // Attach click event listeners to album cards
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async event => {
            // Load the playlist for the selected album and play the first song
            songs = await getSongs(`songs/${event.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

/**
 * The main function to initialize the application.
 * It sets up the initial playlist, albums, and event listeners.
 */
async function main() {
    await getSongs("songs/ncs"); // Fetch the default playlist
    playMusic(songs[0], true); // Play the first song in paused mode
    await displayAlbums(); // Display all albums in the UI

    // Attach play/pause functionality to the play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play(); // Resume playback
            play.src = "img/pause.svg"; // Update icon to pause
        } else {
            currentSong.pause(); // Pause playback
            play.src = "img/play.svg"; // Update icon to play
        }
    });

    // Update song progress and seekbar on time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"; // Update seekbar position
    });

    // Seek to a specific position when the seekbar is clicked
    document.querySelector(".seekbar").addEventListener("click", event => {
        let percent = (event.offsetX / event.target.getBoundingClientRect().width) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100; // Update the playback position
    });

    // Attach toggle functionality to the hamburger menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"; // Open the menu
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"; // Close the menu
    });

    // Attach functionality for previous and next buttons
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index > 0) playMusic(songs[index - 1]); // Play the previous song if available
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index < songs.length - 1) playMusic(songs[index + 1]); // Play the next song if available
    });

    // Attach volume control functionality
    document.querySelector(".range input").addEventListener("change", event => {
        currentSong.volume = parseInt(event.target.value) / 100; // Adjust volume
    });

    // Attach mute/unmute toggle functionality
    document.querySelector(".volume>img").addEventListener("click", event => {
        if (event.target.src.includes("volume.svg")) {
            currentSong.volume = 0; // Mute volume
        } else {
            currentSong.volume = 0.1; // Unmute volume
        }
    });
}

// Run the main function to initialize the app
main();
