/* Global Variables */
let currentSong = new Audio(); // global variable
let songs; // Array to store the list of songs
let currFolder; // Variable to store the current folder being accessed

/* Time Conversion */
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60); // Calculate total minutes
  const remainingSeconds = Math.floor(seconds % 60); // Calculate remaining seconds
  const formattedMinutes = String(minutes).padStart(2, "0"); // Ensure two digits for minutes
  const formattedSeconds = String(remainingSeconds).padStart(2, "0"); // Ensure two digits for seconds
  return `${formattedMinutes}:${formattedSeconds}`; // Return formatted time
}


/* using fetch api to get the songs */

async function getSongs(folder) {
  currFolder = folder; // Set current folder
  try {
    let response = await fetch(`/${folder}`); // Fetch the folder contents
    let textResponse = await response.text(); // Get response text
    let div = document.createElement("div"); // Create a div element to parse the response
    div.innerHTML = textResponse; // Set the innerHTML of the div to the response
    let as = div.getElementsByTagName("a"); // Get all anchor elements (links)
    let songs = []; // Initialize the songs array

    // Loop through all anchor elements to find MP3 files
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp3")) {
        let cleanHref = element.href.replace(`${folder}/${folder}`, folder); // Remove duplicate folders
        songs.push(cleanHref); // Add the clean URL to the songs array
      }
    }

    // Sanitize paths locally
    let sanitizedSongs = songs.map((song) =>
      song.replace("/songs/ncs/ncs/", "/songs/ncs/") // Adjust the sanitization as per your need
    );

    // Update the UI with sanitized song names
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""; // Clear the current list
    for (const song of sanitizedSongs) {
      let displayName = song.split("/").pop(); // Display only the file name
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

    // Attach click listeners to each song in the list
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((element) => {
      element.addEventListener("click", (e) => {
        let songName = element.querySelector(".info").firstElementChild.innerHTML.trim();
        playMusic(songName); // Play the clicked song
      });
    });

    return sanitizedSongs; // Return sanitizedSongs if needed

  } catch (error) {
    console.error("Error fetching songs:", error); // Log any errors
    return [];
  }
}



/* play music funtion */

const playMusic = (track, pause = false) => {
  // Ensure `track` is sanitized
  const sanitizedTrack = track
    .replace(`${currFolder}/`, "")
    .replace(/^\/+/, "");
  const songPath = track.startsWith("http")
    ? track
    : `/${currFolder}/${sanitizedTrack}`.replace(/\/+/g, "/"); // Remove extra slashes

  currentSong.src = songPath; // Set the sanitized path

  if (!pause) {
    currentSong.play(); // Play the song if not paused
    document.querySelector("#play").src = "img/pause.svg"; // Update play button to pause
  }

  document.querySelector(".songsInfo").innerHTML = decodeURI(
    songPath.split("/").pop()
  );
  document.querySelector(".songtime").innerHTML = "00:00/00:00"; // Reset song time display
};

/**
 * Fetches and displays album information and associated songs.
 * This function dynamically retrieves folders from the server, fetches metadata for each folder,
 * and renders album cards with play buttons on the page.
 */
async function displayAlbums() {
  try {
    // Fetch the list of folders from the songs directory
    const response = await fetch(`/songs/`); // Fetch the root songs directory
    const textResponse = await response.text(); // Parse the response as text
    const div = document.createElement("div"); // Create a container to parse HTML content
    div.innerHTML = textResponse; // Populate the container with the server's response

    // Extract all anchor elements from the fetched content
    const anchors = div.getElementsByTagName("a");
    const cardContainer = document.querySelector(".cardContainer"); // Select the container for album cards
    let cardsHTML = ""; // Initialize an empty string to accumulate album card HTML

    // Iterate through all anchor elements to identify valid folders
    for (let index = 0; index < anchors.length; index++) {
      const anchor = anchors[index];

      // Check if the href represents a valid folder and ignore system files like .htaccess
      if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
        // Extract the folder name from the href
        const folder = anchor.href.split("/").filter(segment => segment !== "").pop();

        try {
          // Fetch metadata for the folder (e.g., album title, description)
          const metaResponse = await fetch(`/songs/${folder}/info.json`);
          if (metaResponse.ok) {
            const metadata = await metaResponse.json(); // Parse the metadata as JSON

            // Generate HTML for the album card and append it to the cardsHTML string
            cardsHTML += `
              <div data-folder="${folder}" class="card">                
                <img src="/songs/${folder}/cover.jpg" alt="Album Cover">
                <h2>${metadata.title}</h2>
                <p>${metadata.description}</p>
              </div>`;
          } else {
            // Log an error if metadata fetching fails
            console.warn(`Metadata not found or inaccessible for folder: ${folder}`);
          }
        } catch (error) {
          // Catch and log any errors encountered while fetching folder metadata
          console.error(`Error fetching metadata for folder "${folder}":`, error);
        }
      }
    }

    // Inject the accumulated album cards HTML into the card container
    cardContainer.innerHTML = cardsHTML;

    // Add click event listeners to each album card
    Array.from(document.getElementsByClassName("card")).forEach(card => {
      card.addEventListener("click", async event => {
        const folderName = event.currentTarget.dataset.folder; // Retrieve folder name from the clicked card
        const songs = await getSongs(`songs/${folderName}`); // Fetch songs for the selected album
        if (songs.length > 0) {
          playMusic(songs[0]); // Automatically play the first song in the album
        } else {
          console.warn(`No songs found in folder: ${folderName}`);
        }
      });
    });

  } catch (error) {
    // Catch and log any errors encountered during the album display process
    console.error("Error displaying albums:", error);
  }
}


// aysnc funtion cause above  function returns a pending promisse so created a main function and called the response in that
async function main() {
  // Fetch the list of songs and update the global `songs` array
  songs = await getSongs("songs/ncs");

  // Play the first song (default)
  if (songs.length > 0) {
    playMusic(songs[0], true);
  } else {
    console.error("No songs found!");
  }

  displayAlbums()
  // Event listener for play and pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

// Event listener for updating the song's playback time and seekbar progress
currentSong.addEventListener("timeupdate", () => {
  // Check if the duration is valid to avoid invalid calculations
  if (!currentSong.duration || isNaN(currentSong.duration)) return;

  // Update the displayed song time (current time and duration)
  document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
    currentSong.currentTime
  )}/${secondsToMinutesSeconds(currentSong.duration)}`;

  // Calculate the percentage of the song played
  const percentPlayed = (currentSong.currentTime / currentSong.duration) * 100;

  // Update the position of the seekbar's progress indicator (circle)
  const circle = document.querySelector(".gola");
  if (circle) {
    circle.style.left = `${percentPlayed}%`; // Move the circle to the correct position
  }
});

// Event listener for seeking within the song using the seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  const seekbar = e.target.getBoundingClientRect(); // Get the seekbar dimensions
  const percent = (e.offsetX / seekbar.width) * 100; // Calculate the click position as a percentage

  // Update the song's current playback time
  if (currentSong.duration && !isNaN(currentSong.duration)) {
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  }

  // Update the position of the progress indicator (circle)
  const circle = document.querySelector(".circle");
  if (circle) {
    circle.style.left = `${percent}%`;
  }
});



  // Previous button
  prev.addEventListener("click", () => {
    if (songs.length > 0) {
      let currentSongName = decodeURIComponent(currentSong.src.split("/").pop());
      let index = songs.findIndex((song) => decodeURIComponent(song.split("/").pop()) === currentSongName);
      let prevIndex = (index - 1 + songs.length) % songs.length; // Wrap to last song
      playMusic(songs[prevIndex]);
    }
  });
   // add eventListner for hamburger
   document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add eventListner for close button/icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Next button
  next.addEventListener("click", () => {
    if (songs.length > 0) {
      let currentSongName = decodeURIComponent(currentSong.src.split("/").pop());
      let index = songs.findIndex((song) => decodeURIComponent(song.split("/").pop()) === currentSongName);
      let nextIndex = (index + 1) % songs.length; // Wrap to first song
      playMusic(songs[nextIndex]);
    }
  });

  // Volume control
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
    //console.log(e)
    //because the value for volume is between 0-1
    currentSong.volume=parseInt(e.target.value)/100
  })

  // add event listner to mute the track
  document.querySelector(".volume>img").addEventListener("click" , e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume =0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0
    }
    else{
      e.target.src= e.target.src.replace("mute.svg","volume.svg")
      currentSong.volume=.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10
    }
  })
}

main(); // caling main

