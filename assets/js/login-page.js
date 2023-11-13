document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("psw");

    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.status === 200) {
          const { studentData } = await response.json();

          // Log the constructed URL before redirecting
          const redirectURL = `/StudentHomepage?email=${encodeURIComponent(studentData.email)}`;
          console.log('Redirecting to:', redirectURL);

          // Redirect to the StudentHomepage route with the studentData as query parameters
          window.location.href = redirectURL;
        } else {
          // Handle failed login
          console.error('Error during login:', response.statusText);
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    });
  }
});
