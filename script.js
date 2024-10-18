console.log('Start Java Script');
let currentSong = new Audio();
let currFolder;
let songs;


function formatTime(seconds) {
    // Ensure the input is an integer
    seconds = parseInt(seconds, 10);

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format minutes and seconds with leading zeros if necessary
    const minutesFormatted = minutes.toString().padStart(2, '0');
    const secondsFormatted = remainingSeconds.toString().padStart(2, '0');

    // Return the formatted time string
    return `${minutesFormatted}:${secondsFormatted}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let responce = await a.text();
    // console.log(responce);
    let div = document.createElement("div")
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}/`)[1])
        }
    }

    let songUL = document.querySelector("#songList")
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li >
                            <img class="invert" src="Svg's/music.svg" alt="">
                            <div class="info">
                                <h1>${song.replaceAll("%20", " ")}</h1>
                                <h2>Vaibhav</h2>
                            </div>
                            <img class="invert"  src="Svg's/play.svg" alt="Play Song">
                        </li>`
    }
    console.log(songUL);

    Array.from(document.querySelector("#songList").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
        })

    });
    return songs;
}



let playMusic = (ref) => {
    // let audio=new Audio((/Songs/) + ref)
    //Isse ak baar me ak hi song chalega 
    currentSong.src = `http://127.0.0.1:5500/${currFolder}/` + (ref);
    currentSong.play();
    play.src = "Svg's/pause.svg"

    document.querySelector("#songName").innerHTML = decodeURI(ref)



}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/Songs/`)
    let responce = await a.text();
    let div = document.createElement("div")
    div.innerHTML = responce;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardConatiner")

    Array.from(anchors).forEach(async e => {


        if (e.href.includes("/Songs/")) {
            console.log(e);
            console.log(e.href.split("/Songs/")[1]);

            let folder = e.href.split("/Songs/")[1]


            //Get metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/Songs/${folder}/info.json`)
            let responce = await a.json();
            console.log(responce);

            cardContainer.innerHTML = cardContainer.innerHTML + `<div  data-folder="${folder}" class="card">
                        <div  class="playBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="27" height="27"
                                fill="none" transform="scale(1.3)">
                                <circle cx="12" cy="12" r="10" stroke="#00FF00" stroke-width="1.5" fill="#00FF00" />
                                <path
                                    d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
                                    fill="#000000" />
                            </svg>
                        </div>
                        <img src="/Songs/${folder}/cover.jpeg" alt="">
                    <h2>${responce.Title}</h2>
                    <p>${responce.Description}</p>
                    </div>`

        }
        //Load the playlist when ever card is clicked
        Array.from(document.querySelectorAll(".card")).forEach(e => {
            console.log(e);

            e.addEventListener("click", async item => {
                console.log(item, item.currentTarget.dataset.folder);
                songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
            })


        });

    });

}

async function main() {

    //Display all the albums on the page
    displayAlbums();

    //add event listener to Play,Next and Previous
    play.addEventListener("click", () => {
        if (currentSong.src == "" && currentSong.paused) {
            playMusic(songs[0])

        }
        else if (currentSong.paused) {
            currentSong.play()
            play.src = "Svg's/pause.svg"
        } else {
            currentSong.pause()
            play.src = "Svg's/play.svg"
        }
    })
    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);

        document.querySelector("#songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })
    //Add event listener to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percentage + "%"
        currentSong.currentTime = ((currentSong.duration) * percentage) / 100
    })
    //Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
        document.querySelector(".right").style.opacity = "0.6"
    })

    //Add event listener for Closer
    document.querySelector(".closer").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
        document.querySelector(".right").style.opacity = "1"
    })

    //Add event listener to next button
    next.addEventListener("click", () => {
        // console.log(currentSong.src);
        // console.log(songs);
        // console.log(`${currFolder}/`);        
        let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1]);
        console.log(index);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add event listener to previous button
    previous.addEventListener("click", () => {
        // console.log(currentSong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentSong.src.split(`${currFolder}/`)[1]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })


    //Add event listener on volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        console.log(`The volume level is`, e.target.value, "/ 100");

    })

}

main();