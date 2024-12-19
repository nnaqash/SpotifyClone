/* Global Variables */
const BASE_URL = location.origin; // Dynamically detects the app's base URL
let currentSong = new Audio(); // global variable for playing songs
let songs = []; // Array to store the list of songs
let currFolder = ""; // Variable to store the current folder being accessed

/* Time Conversion */
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

/* Fetch Songs */
async function getSongs(folder) {
  currFolder = folder; // Set the current folder
  try {
    const url = `${BASE_URL}/${folder}`;
    console.log(`Fetching songs from: ${url}`); // Log for debugging
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;
    let as = div.getElementsByTagName("a"); // Get all anchor elements (links)
    let fetchedSongs = [];
    for (let element of as) {
      if (element.href.endsWith(".mp3")) {
        fetchedSongs.push(element.href); // Add the song URL
      }
    }

    if (fetchedSongs.length === 0) {
      document.querySelector(".songList").innerHTML = `<li>No songs found in ${folder}.</li>`;
      return [];
    }

    updateSongListUI(fetchedSongs); // Update the UI with the songs
    return fetchedSongs;
  } catch (error) {
    console.error("Error fetching songs:", error.message);
    document.querySelector(".songList").innerHTML = `<li>Error loading songs. Please try again.</li>`;
    return [];
  }
}

/* Update Song List UI */
function updateSongListUI(fetchedSongs) {
  let songUl = document.querySelector(".songList ul");
  songUl.innerHTML = ""; // Clear the current list
  for (const song of fetchedSongs) {
    let displayName = decodeURIComponent(song.split("/").pop());
    songUl.innerHTML += `
      <li>
        <img class="invert" src="./img/music.svg" alt="music icon">
        <div class="info">
          <div>${displayName}</div>
          <div>NCS</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert" src="./img/play.svg" alt="play icon">
        </div>
      </li>`;
  }

  // Add click listeners to each song
  Array.from(songUl.getElementsByTagName("li")).forEach((element, index) => {
    element.addEventListener("click", () => {
      playMusic(fetchedSongs[index]);
    });
  });
}

/* Play Music */
function playMusic(track, pause = false) {
  currentSong.src = track;
  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src = "img/pause.svg"; // Update play button to pause
  }
  document.querySelector(".songsInfo").textContent = decodeURIComponent(track.split("/").pop());
}

/* Fetch and Display Albums */
async function displayAlbums() {
  try {
    const url = `${BASE_URL}/songs/`;
    console.log(`Fetching albums from: ${url}`); // Log for debugging
    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }
    let textResponse = await response.text();
    let div = document.createElement("div");
    div.innerHTML = textResponse;

    // Extract all anchor elements
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let cardsHTML = "";

    for (let anchor of anchors) {
      if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
        let folder = anchor.href.split("/").filter((segment) => segment !== "").pop();
        try {
          let metaResponse = await fetch(`${BASE_URL}/songs/${folder}/info.json`);
          if (metaResponse.ok) {
            let metadata = await metaResponse.json();
            cardsHTML += `
              <div data-folder="${folder}" class="card">
                <img src="/songs/${folder}/cover.jpg" alt="Album Cover">
                <h2>${metadata.title}</h2>
                <p>${metadata.description}</p>
              </div>`;
          }
        } catch {
          console.warn(`No metadata found for ${folder}`);
        }
      }
    }

    cardContainer.innerHTML = cardsHTML;

    // Add event listeners to album cards
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", async () => {
        const folderName = card.dataset.folder;
        songs = await getSongs(`songs/${folderName}`);
        if (songs.length > 0) playMusic(songs[0]);
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error.message);
    document.querySelector(".cardContainer").innerHTML = `<p>Error loading albums. Please try again.</p>`;
  }
}

/* Main Function */
async function main() {
  songs = await getSongs("songs/ncs");
  if (songs.length > 0) playMusic(songs[0], true);

  displayAlbums();

  document.querySelector("#play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.querySelector("#play").src = "img/pause.svg";
    } else {
      currentSong.pause();
      document.querySelector("#play").src = "img/play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    if (currentSong.duration) {
      const percentPlayed = (currentSong.currentTime / currentSong.duration) * 100;
      document.querySelector(".gola").style.left = `${percentPlayed}%`;
    }
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = (e.offsetX / e.target.offsetWidth) * 100;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
}

main();
