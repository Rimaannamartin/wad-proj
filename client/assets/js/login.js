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
  console.log("Login page loaded");
  
  // Check if user is already logged in
  checkExistingAuth();

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
// CHECK EXISTING AUTHENTICATION
// =============================
function checkExistingAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  
  console.log("Existing auth check:");
  console.log("Token:", token);
  console.log("User:", user);
  
  if (token && user) {
    console.log("User already logged in, redirecting...");
    // Optional: Redirect to home if already logged in
    // window.location.href = "index.html";
  }
}

// =============================
// LOGIN FUNCTION - IMPROVED
// =============================
async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;

  if (!email || !password) {
    alert("❌ Please fill in all fields");
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
  submitBtn.disabled = true;

  try {
    console.log("Attempting login with:", { email, password: "***" });
    
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    
    console.log("Login API Response:", data);
    console.log("Response status:", res.status);

    if (res.ok && data.success) {
      console.log("✅ Login successful, processing response...");
      
      // Clear any existing auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userEmail");
      
      // Save authentication data - handle different response structures
      let tokenSaved = false;
      let userSaved = false;
      
      // Try different possible token locations in response
      if (data.token) {
        localStorage.setItem("token", data.token);
        tokenSaved = true;
        console.log("✅ Token saved from data.token");
      } else if (data.data && data.data.token) {
        localStorage.setItem("token", data.data.token);
        tokenSaved = true;
        console.log("✅ Token saved from data.data.token");
      }
      
      // Try different possible user locations in response
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        userSaved = true;
        console.log("✅ User saved from data.user");
      } else if (data.data && data.data.user) {
        localStorage.setItem("user", JSON.stringify(data.data.user));
        userSaved = true;
        console.log("✅ User saved from data.data.user");
      } else {
        // Create minimal user object from available data
        const userObj = {
          email: email,
          name: data.name || email.split('@')[0]
        };
        localStorage.setItem("user", JSON.stringify(userObj));
        userSaved = true;
        console.log("✅ User saved from constructed object");
      }
      
      // Always save email
      localStorage.setItem("userEmail", email);
      
      console.log("Final localStorage state:");
      console.log("Token:", localStorage.getItem("token"));
      console.log("User:", localStorage.getItem("user"));
      console.log("UserEmail:", localStorage.getItem("userEmail"));
      
      if (!tokenSaved) {
        console.warn("⚠️ No token found in response. Posts may not work.");
      }
      
      alert("✅ Login successful! Redirecting...");
      
      // Brief delay to ensure localStorage is updated
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);
      
    } else {
      // Login failed
      const errorMessage = data.message || "Invalid login credentials";
      console.error("❌ Login failed:", errorMessage);
      alert(`❌ ${errorMessage}`);
    }
  } catch (err) {
    console.error("🚨 Login error:", err);
    alert("❌ Server error. Please try again later.");
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
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
// REGISTER FUNCTION - IMPROVED
// =============================
async function registerUser(e) {
  e.preventDefault();
  
  const name = document.querySelector("#username").value.trim();
  const email = document.querySelector("#gmail").value.trim();
  const password = document.querySelector("#password").value;
  const confirmPassword = document.querySelector("#confirmPassword").value;

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  if (!name || !email || !password) {
    alert("❌ Please fill in all fields");
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
  submitBtn.disabled = true;

  try {
    console.log("Attempting registration:", { name, email, password: "***" });
    
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();
    console.log("Registration response:", data);

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
    console.error("Registration error:", err);
    alert("❌ Server error. Try again later.");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// =============================
// OTP VERIFICATION HANDLER - IMPROVED
// =============================
function attachOtpHandler(email) {
  const otpForm = document.querySelector("#otpForm");
  const resendBtn = document.querySelector("#resendOtpBtn");
  const otpMessage = document.querySelector("#otpMessage");

  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const otp = document.querySelector("#otpInput").value.trim();

    if (!otp) {
      otpMessage.textContent = "❌ Please enter OTP";
      otpMessage.className = "error";
      return;
    }

    // Show loading
    const verifyBtn = e.target.querySelector('button[type="submit"]');
    const originalText = verifyBtn.innerHTML;
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    verifyBtn.disabled = true;

    try {
      const res = await fetch(`${BASE_URL}/verifyotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      console.log("OTP verification response:", data);

      if (res.ok) {
        otpMessage.textContent = "✅ OTP verified successfully!";
        otpMessage.className = "success";
        
        // Auto-login after successful verification
        if (data.token || data.data?.token) {
          const token = data.token || data.data.token;
          const user = data.user || data.data?.user || { email, name: document.querySelector("#username")?.value || email.split('@')[0] };
          
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("userEmail", email);
          
          console.log("Auto-login after OTP verification successful");
          
          setTimeout(() => {
            alert("🎉 Registration complete! You are now logged in.");
            window.location.href = "index.html";
          }, 1500);
        } else {
          setTimeout(() => {
            alert("Registration complete! Please login now.");
            location.reload();
          }, 1500);
        }
      } else {
        otpMessage.textContent = "❌ " + (data.message || "Invalid OTP");
        otpMessage.className = "error";
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      otpMessage.textContent = "❌ Server error. Try again later.";
      otpMessage.className = "error";
    } finally {
      verifyBtn.innerHTML = originalText;
      verifyBtn.disabled = false;
    }
  });

  resendBtn.addEventListener("click", async () => {
    // Show loading on resend button
    const originalText = resendBtn.innerHTML;
    resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    resendBtn.disabled = true;

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
      console.error("Resend OTP error:", err);
      otpMessage.textContent = "❌ Server error. Try again later.";
      otpMessage.className = "error";
    } finally {
      resendBtn.innerHTML = originalText;
      resendBtn.disabled = false;
    }
  });
}

// =============================
// LOGOUT FUNCTION
// =============================
async function logoutUser() {
  try {
    // Clear localStorage first
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    
    console.log("LocalStorage cleared, calling logout API...");
    
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    alert(data.message || "Logged out successfully");
    
    // Redirect to login page
    window.location.href = "login.html";
  } catch (err) {
    console.error("Logout error:", err);
    // Still clear localStorage and redirect even if API call fails
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
  }
}

// =============================
// UTILITY FUNCTIONS
// =============================
function getAuthToken() {
  return localStorage.getItem("token");
}

function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem("token");
}