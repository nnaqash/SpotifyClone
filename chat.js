// Utility: Convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
      return "Invalid input";
    }
  
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  
  // Global variables
  let currentSong = new Audio();
  let songs = [];
  let currentIndex = 0;
  
  // Fetch song list from the server
  async function getSongs() {
    try {
      let response = await fetch("http://127.0.0.1:5500/songs/");
      if (!response.ok) {
        throw new Error(`Failed to fetch songs: ${response.statusText}`);
      }
  
      let text = await response.text();
      let div = document.createElement("div");
      div.innerHTML = text;
  
      let as = div.getElementsByTagName("a");
      let songList = [];
      for (let element of as) {
        if (element.href.endsWith(".mp3")) {
          songList.push(element.href);
        }
      }
  
      return songList;
    } catch (error) {
      console.error("Error fetching songs:", error);
      return [];
    }
  }
  
  // Play a song
  const playMusic = (track, pause = false) => {
    const songPath = track.startsWith("http") ? track : `/songs/${track}`;
    currentSong.src = songPath;
  
    if (!pause) {
      currentSong.play();
      document.querySelector("#playButton").src = "img/pause.svg";
    }
  
    document.querySelector(".songsInfo").innerHTML = decodeURI(songPath.split("/").pop());
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
  };
  
  // Populate the song list in the UI
  function populateSongList(songs) {
    let songUl = document.querySelector(".songList ul");
    let fragment = document.createDocumentFragment();
  
    for (const song of songs) {
      let li = document.createElement("li");
      li.innerHTML = `
        <img class="invert" src="./img/music.svg" alt="music icon">
        <div class="info">
          <div>${song.replaceAll("http://127.0.0.1:5500/songs/", "")}</div>
          <div>NCS</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert" src="./img/play.svg" alt="play icon">
        </div>`;
      li.addEventListener("click", () => {
        currentIndex = songs.indexOf(song);
        playMusic(song);
      });
      fragment.appendChild(li);
    }
  
    songUl.appendChild(fragment);
  }
  
  // Initialize the app
  async function main() {
    // Fetch songs
    songs = await getSongs();
    if (songs.length === 0) {
      document.querySelector(".songList ul").innerHTML = "<li>No songs available</li>";
      return;
    }
  
    // Populate song list and play the first song (paused by default)
    populateSongList(songs);
    playMusic(songs[0], true);
  
    // Add play/pause button event listener
    const playButton = document.querySelector("#playButton");
    playButton.addEventListener("click", () => {
      if (currentSong.paused) {
        currentSong.play();
        playButton.src = "img/pause.svg";
      } else {
        currentSong.pause();
        playButton.src = "img/play.svg";
      }
    });
  
    // Update time display as the song plays
    currentSong.addEventListener("timeupdate", () => {
      if (!isNaN(currentSong.duration)) {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
      }
    });
  
    // Add next and previous buttons
    document.querySelector("#nextButton").addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % songs.length;
      playMusic(songs[currentIndex]);
    });
  
    document.querySelector("#prevButton").addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + songs.length) % songs.length;
      playMusic(songs[currentIndex]);
    });
  }
  
  // Start the application
  main();
  