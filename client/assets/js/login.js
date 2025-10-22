// =============================
// LOGIN & SIGNUP PAGE HANDLER
// =============================

// State variables
let currentUserEmail = null;

// =============================
// API BASE URL
// =============================
const BASE_URL = "http://localhost:5000/api/v1/userAuth";

// =============================
// DOM ELEMENTS
// =============================
const signup = document.querySelector(".sign_up");
const loginContainer = document.querySelector(".login-container");

// =============================
// EVENT LISTENERS
// =============================
document.addEventListener("DOMContentLoaded", () => {
  // Login form handler
  const loginForm = document.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Signup toggle handler
  if (signup) {
    signup.addEventListener("click", showSignupForm);
  }
});

// =============================
// LOGIN FUNCTION
// =============================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.querySelector("#loginEmail").value;
  const password = document.querySelector("#loginPassword").value;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Login successful!");
      localStorage.setItem("userEmail", email);
      window.location.href = "index.html"; // Redirect to main dashboard
    } else {
      alert(data.message || "❌ Invalid login credentials");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
}

// =============================
// SHOW SIGNUP FORM
// =============================
function showSignupForm() {
  loginContainer.innerHTML = `
    <h1>Sign Up</h1>
    <div class="innerContainer">
      <form id="signupForm">
        <input type="text" id="username" placeholder="Full Name" required>
        <input type="email" id="gmail" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
        <button type="submit">Sign Up</button>
      </form>

      <!-- OTP Verification Section -->
      <div id="otpVerificationSection" class="otp-section hidden">
        <h3>Verify OTP</h3>
        <form id="otpForm">
          <input type="text" id="otpInput" placeholder="Enter OTP" maxlength="6" required>
          <button type="submit">Verify OTP</button>
          <p id="otpMessage"></p>
          <button type="button" id="resendOtpBtn" class="resend-btn">Resend OTP</button>
        </form>
      </div>

      <p class="reload">Back to Login</p>
    </div>
  `;

  const loginReload = document.querySelector(".reload");
  loginReload.addEventListener("click", () => location.reload());

  const signupForm = document.querySelector("#signupForm");
  signupForm.addEventListener("submit", registerUser);
}

// =============================
// REGISTER FUNCTION
// =============================
async function registerUser(e) {
  e.preventDefault();
  const name = document.querySelector("#username").value;
  const email = document.querySelector("#gmail").value;
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ OTP sent to your email. Please verify.");

      currentUserEmail = email;
      document.querySelector("#signupForm").classList.add("hidden");
      document.querySelector("#otpVerificationSection").classList.remove("hidden");

      attachOtpHandler(email);
    } else {
      alert(data.message || "❌ Registration failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Try again later.");
  }
}

// =============================
// OTP VERIFICATION HANDLER
// =============================
function attachOtpHandler(email) {
  const otpForm = document.querySelector("#otpForm");
  const resendBtn = document.querySelector("#resendOtpBtn");
  const otpMessage = document.querySelector("#otpMessage");

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.querySelector("#otpInput").value;

    try {
      const res = await fetch(`${BASE_URL}/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        otpMessage.textContent = "✅ OTP verified successfully!";
        otpMessage.className = "success";
        setTimeout(() => {
          alert("Registration complete! Please login now.");
          location.reload(); // Go back to login
        }, 1500);
      } else {
        otpMessage.textContent = "❌ " + (data.message || "Invalid OTP");
        otpMessage.className = "error";
      }
    } catch (err) {
      console.error(err);
      otpMessage.textContent = "❌ Server error. Try again later.";
      otpMessage.className = "error";
    }
  });

  resendBtn.addEventListener("click", async () => {
    try {
      const res = await fetch(`${BASE_URL}/resendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        otpMessage.textContent = "✅ OTP resent to your email!";
        otpMessage.className = "success";
        setTimeout(() => {
          otpMessage.textContent = "";
        }, 3000);
      } else {
        otpMessage.textContent = "❌ " + (data.message || "Failed to resend OTP");
        otpMessage.className = "error";
      }
    } catch (err) {
      console.error(err);
      otpMessage.textContent = "❌ Server error. Try again later.";
      otpMessage.className = "error";
    }
  });
}

// =============================
// LOGOUT FUNCTION (optional)
// =============================
async function logoutUser() {
  try {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    alert(data.message || "Logged out successfully");
    localStorage.removeItem("userEmail");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Error logging out");
  }
}