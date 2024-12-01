document.addEventListener("DOMContentLoaded", () => {
   
    setTimeout(() => {
        document.getElementById("loader").style.display = "none"; 
        document.getElementById("loginContent").style.display = "block"; // Display content
    }, 2000); 
});


document.getElementById("loginForm")?.addEventListener("submit", async function (event) {
    event.preventDefault(); 

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // save username and user_id to localstorage
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("user_id", data.user.id);

           // alert("Login successful! Redirecting to game...");
            window.location.href = "index.html"; // Redirect to the game
        } else {
            alert(data.message || "Login failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
    }
});
