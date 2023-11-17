document.addEventListener("DOMContentLoaded", function () {
  // Get a reference to the login form by its ID
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    // Get references to the input fields
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("psw");

    // Add an event listener for the form submission
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent the default form submission

      // Show the loading screen
      showLoadingScreen();

      // Get the user's email and password from the input fields
      const email = emailInput.value;
      const password = passwordInput.value;

      // Send a POST request to your server with the login data
      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          // Handle login failure
          console.error('Error during login:', response.statusText);
          // Hide the loading screen in case of an error
          hideLoadingScreen();
          return;
        }

        // Parse the JSON response
        const data = await response.json();

        // Check the user's account type and redirect accordingly
        if (data.accountType === 'Student') {
          window.location.href = '/StudentHomepage'; // Redirect to student homepage
        } else if (data.accountType === 'Counselor') {
          window.location.href = '/CounselorHomepage'; // Redirect to counselor homepage
        } else {
          console.error('Unknown account type:', data.accountType);
        }
      } catch (error) {
        console.error('Error during login:', error);
        // Hide the loading screen in case of an error
        hideLoadingScreen();
      }
    });
  }
});

// Function to show the loading screen
function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex";
  }
}

// Function to hide the loading screen
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}