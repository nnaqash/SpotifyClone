//console.log("js time boieee");

let currentSong = new Audio(); // global variable
let songs;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Calculate the total minutes by dividing seconds by 60 and rounding down.

  const minutes = Math.floor(seconds / 60);

  // Calculate the remaining seconds using the modulus operator.
  const remainingSeconds = Math.floor(seconds % 60);

  // Ensure minutes and seconds are displayed with two digits.
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the formatted time string in MM:SS format.
  return `${formattedMinutes}:${formattedSeconds}`;
}

/* using fetch api to get the songs */

/* creating a main function to run aysnc await cause await is only avaliable that way */
async function getSongs(params) {
  let a = await fetch("http://127.0.0.1:5500/songs/"); // fetching the URL of the songs

  let response = await a.text(); // awaiting the response
  //console.log(response);
  let div = document.createElement("div"); // creating a div ?
  div.innerHTML = response;
  let as = div.getElementsByTagName("a"); // targetinng all the a tags which have the url of the songs
  let songs = []; // creating an emputy array
  // looping over all the array elements and pusshing the urls that end with mp3
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
}

/* play music funtion */

const playMusic = (track, pause = false) => {
  const songPath = track.startsWith("http") ? track : `/songs/${track}`;
  currentSong.src = songPath;

  if (!pause) {
    currentSong.play();
    document.querySelector("#play").src = "img/pause.svg";
  }

  document.querySelector(".songsInfo").innerHTML = decodeURI(
    songPath.split("/").pop()
  );
  document.querySelector(".songtime").innerHTML = "00:00/00:00";
};
// aysnc funtion cause above  function returns a pending promisse so created a main function and called the response in that
async function main() {
  // getting the list of the songs
  songs = await getSongs();
  playMusic(songs[0], true);
  //console.log(songs);

  /* listing all the songs under library page */
  //creating songUl variable and targetting songlist class using queryselector and in the class get all the ul at index 0
  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  // using for of loop to iterate over the arry of songs and printing them with li
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li><img class="invert" src="./img/music.svg" alt="music icon">
                <div class="info">
                  <div>${song.replaceAll(
                    "http://127.0.0.1:5500/songs/",
                    ""
                  )}</div>
                  <div>NCS</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class ="invert" src="./img/play.svg" alt="play icon">
                </div></li>`;
  }

  /* attaching event listener to each song */
  //getting the lis in the songList in an array
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((element) => {
    element.addEventListener("click", (e) => {
      console.log(element.querySelector(".info").firstElementChild.innerHTML);
      playMusic(
        element.querySelector(".info").firstElementChild.innerHTML.trim()
      );
    });
    //console.log(element)
  });

  /* play pause and next */

  //event listner for play and pause
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // listn for timeupdate event listener
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // getBoundingClientRect gives us the exact position on the page.
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
    //console.log(e.target, e.offsetX)
  });

  // add eventListner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add eventListner for close button/icon
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add an event listener for previous and next
  // Previous button functionality
  prev.addEventListener("click", () => {
    console.log("Previous button clicked");
    
    // Ensure currentSong and its src are valid
    if (!currentSong || !currentSong.src) {
      console.error("currentSong or currentSong.src is not defined");
      return;
    }

    // Extract the current song name from the URL
    let currentSongName = currentSong.src.split("/").slice(-1)[0];
    console.log("Current song name:", currentSongName);

    // Find the current song's index in the songs array
    let index = songs.findIndex(song => song.endsWith(currentSongName));
    console.log("Current song index:", index);

    // Check if the index is valid and move to the previous song if possible
    if (index > 0) {
      playMusic(songs[index - 1]);
    } else {
      console.log("Already at the first song. No previous song available.");
    }
  });

// Next button functionality
  next.addEventListener("click", () => {
    console.log("Next button clicked");
    currentSong.pause()
    // Ensure currentSong and its src are valid
    if (!currentSong || !currentSong.src) {
      console.error("currentSong or currentSong.src is not defined");
      return;
    }

    // Extract the current song name from the URL
    let currentSongName = currentSong.src.split("/").slice(-1)[0];
    console.log("Current song name:", currentSongName);

    // Find the current song's index in the songs array
    let index = songs.findIndex(song => song.endsWith(currentSongName));
    console.log("Current song index:", index);

    // Check if the index is valid and move to the next song if possible
    if (index !== -1 && index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      console.log("Already at the last song. No next song available.");
    }
  });



}
main(); // caling main

//http://127.0.0.1:5500/songs/after-the-rain-fss-no-copyright-music-252574.mp3

//play song code from stack overflow
//var audio = new Audio(songs[0]);
//audio.play();

/*  audio.addEventListener("loadeddata", () => {
    console.log(audio.duration, audio.currentSrc, audio.currentTime);
  }); */
