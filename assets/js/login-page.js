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
      }
    });
  }
});
