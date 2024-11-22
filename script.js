//console.log("js time boieee");

/* using fetch api to get the songs */

/* creating a main function to run aysnc await cause await is only avaliable that way */
async function getSongs(params) {
  let a = await fetch("http://127.0.0.1:5500/songs/"); // fetching the URL of the songs

  let response = await a.text(); // awaiting the response
  console.log(response);
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
// aysnc funtion cause above  function returns a pending promisse so created a main function and called the response in that
async function main() {
  // getting the list of the songs
  let songs = await getSongs();
  console.log(songs);

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
                  <div>${song.replaceAll("http://127.0.0.1:5500/songs/", "")}</div>
                  <div>NCS</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img class ="invert" src="./img/play.svg" alt="play icon">
                </div></li>`;
      
  }
  //http://127.0.0.1:5500/songs/after-the-rain-fss-no-copyright-music-252574.mp3

  //play song code from stack overflow
  var audio = new Audio(songs[0]);
  //audio.play();

  audio.addEventListener("loadeddata", () => {
    console.log(audio.duration, audio.currentSrc, audio.currentTime);
  });
}
main(); // caling main
