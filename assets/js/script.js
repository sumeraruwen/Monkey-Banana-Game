let bushNumber;
let up = false;
let clicked = false;
let ariaValue = 100;
let gameInterval;
let timeInterval;
let decHealth = 10;
let level = 1;

let paused = false; // Pause state
let remainingTime = 60; // Keep track remaining time
let gameIntervalDuration = 2000; // Interval based on the level
let gameRunning = false; // Check game is already running

const shotAudio = new Audio("https://rpg.hamsterrepublic.com/wiki-images/d/d7/Oddbounce.ogg");
const backgroundAudio = new Audio("assets/audio/background.mp3");
const laughAudio = new Audio("assets/audio/laugh.mp3");
const winAudio = new Audio("assets/audio/win-sound.mp3");
backgroundAudio.loop = true;

// Get username and user_id
const userId = localStorage.getItem("user_id");
const username = localStorage.getItem("username");

if (username && userId) {
    console.log("Logged-in user:", username);
    console.log("Logged-in id:", userId);

    const userDisplay = document.getElementById("userDisplay");
    if (userDisplay) {

        userDisplay.textContent = `${username}!`;
    }
} else {
    console.log("No user logged in.");
    alert("You need to log in to play the game!");
    window.location.href = "login.html"; // Redirect to login
}


// ------------- Load State from URL Parameters -----------------------

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    level = parseInt(urlParams.get("level"), 10) || 1;
    ariaValue = parseInt(urlParams.get("health"), 10) || 100;
    decHealth = parseInt(urlParams.get("decHealth"), 10) || 10;

    startGame(); // Start the game with the updated state
});

// ------------- Monkey Moving Actions -----------------------

function monkeyAction() {
    clicked = false;
    $(".monkey").attr("style", "background : url(assets/img/monkey.png) !important;");
    bushNumber = chooseRandomBush();
    $(".monkey" + bushNumber).css("top", "0%");
    setTimeout(monkeyIn, 1500);
    up = false;
}

function monkeyIn() {
    $(".monkey" + bushNumber).css("top", "10%");
}

function chooseRandomBush() {
    return Math.floor(Math.random() * 6);
}

// Update the Swal.fire callback

$(".monkey").on("mousedown", function () {
    let top = $(this).css("top");
    if (top == "0px" && !clicked) {
        up = true;
        clicked = true;
        $(".monkey").css("background", "url(assets/img/monkey-attacked.png)");
        ariaValue -= decHealth;
        $(".progress-bar").attr("aria-valuenow", ariaValue);
        $(".progress-bar").css("width", `${ariaValue}%`);
        $("#score").empty();
        $("#score").append(`${100 - ariaValue}/100`);

        if (ariaValue <= 0) {
            backgroundAudio.volume = 0;
            winAudio.play();
            clearInterval(timeInterval);
            clearInterval(gameInterval);


if (ariaValue <= 0) {
    backgroundAudio.volume = 0;
    winAudio.play();
    clearInterval(timeInterval);
    clearInterval(gameInterval);

    if (level >= 3) {
        const score = 300 - ariaValue; // Calculate the final score

        fetch("http://localhost:3000/saveScore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId, 
                score: score,    // Pass final score
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Score saved successfully:", data.message);
        })
        .catch((error) => {
            console.error("Error saving score:", error);
        });
    }

    Swal.fire({
        title: level >= 3 ? "Game Won!" : "Milestone to Next Level..!",
        text: "What would you like to do next?",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: level >= 3 ? "Play Again" : "Continue",
        cancelButtonText: "Log out",
        showDenyButton: true, 
        denyButtonText: "View Leaderboard", 
    }).then((result) => {
        if (result.isConfirmed) {
            if (level <= 3) {
                // Redirect next level 
                const params = new URLSearchParams({
                    level: level + 1, // Increment the level
                    health: 100, // Reset health
                    decHealth: decHealth - 1, // Decrease health penalty for the next level
                    score: score, // Pass score
                });
                window.location.href = `banana.html?${params.toString()}`;
            } else {
                // Restart
                startGame();
            }
        } else if (result.isDenied) {
            window.location.href = "leaderboard.html";
        } else {
            // Log out & redirect to login
            logoutUser(); 
            window.location.href = "login.html";
        }
    });
}

}

     }
 });



//------------- Background Audio -----------------------


shotAudio.play().catch(e => {
    $(".monkey").on("click", function () {
        if (up) {
            shotAudio.play();
        }
    });
});

backgroundAudio.play().catch(e => {
    $("#btnStart").on("click", function () {
        backgroundAudio.volume = 1;
        backgroundAudio.play();
    });
});

$("#btnStart").on("click", function () {
    startGame();
});


//------------- Timer -----------------------

function timer() {
    let x = 60;
    clearInterval(timeInterval);
    timeInterval = setInterval(function () {
        if (x >= 0) {
            $("#txtTime").text(x);
            x--;
        } else {
            laugh();
            laughAudio.play();
            clearInterval(timeInterval);
            $(".over").css("display", "flex");
        }
    }, 1000);
}

// ------------- Game Start -----------------------


function startGame() {
    if (paused) return; // paused

    if (!gameRunning) {
        ariaValue = 100;
        $("#btnStart").css("display", "none");
        $("#btnStop").css("display", "block");
        $("#main-image").css("display", "none");
        $(".progress-bar").attr("aria-valuenow", 100);
        $(".progress-bar").css("width", "100%");
        $("#score").empty();
        $("#score").append("00/100");
        backgroundAudio.volume = 1;
        $(".over").css("display", "none");
        $("#lblLevel").text("Level " + level); // Update level show
    }

    // Always restart intervals when starting or resuming the game
    clearInterval(gameInterval);
    gameInterval = setInterval(monkeyAction, Math.max(2000 - level * 100, 1000)); // Interval based on level
    clearInterval(timeInterval);
    timer();

    gameRunning = true; 
}

document.getElementById("btnPausePlay").addEventListener("click", function () {
    if (paused) {
      
        paused = false;
        $("#btnPausePlay img").attr("src", "assets/img/pause.png"); // Change to pause icon
        backgroundAudio.play(); // Resume music
        startGame(); 
    } else {
       
        paused = true;
        $("#btnPausePlay img").attr("src", "assets/img/play.png"); // Change to play icon
        backgroundAudio.pause(); 
        clearInterval(gameInterval); 
        clearInterval(timeInterval); // Stop the timer
    }
});


$(".over > button").on("click", function () {
    ariaValue = 100;
    $(".progress-bar").css("width", `100%`);
    gameRunning = false; 
    paused = false; 
    startGame();
});

$("#btnStop").on("click", function () {
    clearInterval(timeInterval);
    clearInterval(gameInterval);
    gameRunning = false; 
    paused = false; 
    startGame();
});

function gameOver() {
    laughAudio.play(); 
    $(".over").css("display", "flex"); // Show "Game Over" screen
    clearInterval(gameInterval); // Stop monkey actions
    gameRunning = false;
    paused = false; 
    remainingTime = 60; 
    ariaValue = 100; 

    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");

    if (userId && username) {
        const score = 300 - ariaValue; // Calculate final score
        fetch("http://localhost:3000/saveScore", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId, // User ID server validation
                score: score,    // Pass score
            }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Score saved successfully:", data.message);
        })
        .catch((error) => {
            console.error("Error saving score:", error);
        });
    } else {
        console.warn("User is not logged in. Score cannot be saved.");
    }


    Swal.fire({
        title: "Game Over!",
        text: "What would you like to do next?",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Play Again",
        cancelButtonText: "Log out",
        showDenyButton: true, 
        denyButtonText: "View Leaderboard", 
    }).then((result) => {
        if (result.isConfirmed) {
            startGame();
        } else if (result.isDenied) {
            window.location.href = "leaderboard.html"; 
        } else {
            
            logoutUser(); // Call logout 
            window.location.href = "login.html"; 
        }
    });
}

// Logout function

function logoutUser() {
    localStorage.removeItem("userSession"); // Clear storedsession 
    sessionStorage.removeItem("userSession"); 
    console.log("User logged out successfully.");
}

//----------------- Home function --------------

document.getElementById("btnHome").addEventListener("click", function () {
    Swal.fire({
        title: "Home",
        text: "What would you like to do?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Log out",
        cancelButtonText: "View Leaderboard",
    }).then((result) => {
        if (result.isConfirmed) {
           
            logoutUser(); 
            window.location.href = "login.html"; 
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = "leaderboard.html"; 
        }
    });
});


function timer() {
    let x = remainingTime;
    clearInterval(timeInterval); 
    timeInterval = setInterval(function () {
        if (paused) return; 

        if (x >= 0) {
            $("#txtTime").text(x);
            remainingTime = x; 
            x--;
        } else {
            clearInterval(timeInterval);
            gameOver();  // Timesup game over
        }
    }, 1000);
}


//------------- Loading Timer -----------------------


function timerAfterWon() {
    let x = 3;
    let wonInterval = null;
    clearInterval(wonInterval);
    $(".message").css("display", "flex");
    wonInterval = setInterval(function () {
        if (x >= 0) {
            $(".message > p, .message > h1").empty();
            $(".message > h1").append("Level " + level);
            $(".message > p").append(x == 0 ? "" : x);
        } else {
            clearInterval(wonInterval);
            $(".message").css("display", "none");
            $(".message > p").append("...");
            return;
        }
        x--;
    }, 1000);
}

//------------- retry -----------------------

function resetGame(newLevel, newHealth) {
    clearInterval(gameInterval);
    clearInterval(timeInterval);
    level = newLevel || 1;
    ariaValue = newHealth || 100;
    remainingTime = 60;
    paused = false;
    gameRunning = false;

    $(".progress-bar").attr("aria-valuenow", ariaValue).css("width", `${ariaValue}%`);
    $("#lblLevel").text(`Level ${level}`);
    $("#txtTime").text(remainingTime);
    $("#score").text(`00/${ariaValue * 3}`);
    $(".over").css("display", "none");
}


//------------- Audio -----------------------

function laugh() {
    backgroundAudio.volume = 0;
    laughAudio.addEventListener("canplaythrough", () => {

    });
}

$(".over > button").on("click", function () {
    ariaValue = 100;
    $(".progress-bar").css("width", `100%`);
    startGame();
});

//------------- Pause -----------------------

$("#btnStop").on("click", function () {
    clearInterval(timeInterval);
    clearInterval(gameInterval);
    startGame();
})

