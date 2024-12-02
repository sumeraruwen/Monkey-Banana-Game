document.addEventListener("DOMContentLoaded", () => {
    const questionImage = document.getElementById("question-image");
    const answerInput = document.getElementById("answer-input");
    const checkButton = document.getElementById("check-button");
    const toastContainer = document.getElementById("toast-container");

    let data = null;
    let answer = "";
    let timerInterval;
    let countdown = 30;

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let currentLevel = parseInt(urlParams.get("level"), 10) || 1;
    let currentHealth = parseInt(urlParams.get("health"), 10) || 100;
    let decHealth = parseInt(urlParams.get("decHealth"), 10) || 10;
    let score = parseInt(urlParams.get("score"), 10) || 0;


   // Update score
    const updateScore = (points) => {
        score += points;
        document.getElementById("score-display").textContent = `Score: ${score}`;
    };

    // Fetch data from API
    const fetchData = async () => {
        try {
            const response = await fetch('https://marcconrad.com/uob/banana/api.php?out=json');
            data = await response.json();
            questionImage.src = data.question;
            console.log(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Toast notification
    const showToast = (message, success = true) => {
        const toast = document.createElement("div");
        toast.className = `toast ${success ? "success" : "error"}`;
        toast.textContent = message;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    // Check the answer
    const checkAnswer = () => {
        if (data && parseInt(answer, 10) === parseInt(data.solution, 10)) {
            clearInterval(timerInterval);
            showToast("Answer is correct!");

            setTimeout(() => {
                const params = new URLSearchParams({
                    level: currentLevel, // Increment the level
                    health: 100,
                    decHealth: decHealth - 1,
                });

                window.location.href = `index.html?${params.toString()}`;
            }, 2000);
        } else {
            showToast("Answer is incorrect!", false);
        }
    };

    // Display the timer
    const startTimer = () => {
        const timerDisplay = document.createElement("div");
        timerDisplay.id = "timer-display";
        timerDisplay.style.fontSize = "2rem";
        timerDisplay.style.marginTop = "10px";
        timerDisplay.textContent = `Time Left: ${countdown}s`;
        document.querySelector(".banana-game").appendChild(timerDisplay);

        timerInterval = setInterval(() => {
            countdown -= 1;
            timerDisplay.textContent = `Time Left: ${countdown}s`;

            if (countdown <= 0) {
                clearInterval(timerInterval);
    
              Swal.fire({
                title: "Game Over!",
                text: "What would you like to do next?",
                icon: "error",
                showCancelButton: true,
                confirmButtonText: "Play Again",
                cancelButtonText: "Log Out",
                showDenyButton: true,
                denyButtonText: "View Leaderboard",
            }).then((result) => {
                if (result.isConfirmed) {
                    // Restart the game
                    window.location.href = "index.html"; 
                } else if (result.isDenied) {
                    //  leaderboard
                    window.location.href = "leaderboard.html"; 
                } else {
                    window.location.href = "login.html"; // Navigate 
                }
            });
            

            }
        }, 1000);
    };

    answerInput.addEventListener("input", (event) => {
        answer = event.target.value;
    });

    checkButton.addEventListener("click", checkAnswer);

    fetchData();
    startTimer();
});
