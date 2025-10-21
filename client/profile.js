// Simulated database for uniqueness check
let profiles = [];

// Letters-only for Name & Surname
const nameFields = [
  document.getElementById("firstName"),
  document.getElementById("surname")
];
nameFields.forEach(field => {
  field.addEventListener("input", () => {
    field.value = field.value.replace(/[^a-zA-Z]/g, '');
    checkFormValidity();
  });
});

// Phone: digits only, max 10
const phoneField = document.getElementById("phone");
phoneField.addEventListener("input", function() {
  this.value = this.value.replace(/[^0-9]/g, '');
  if(this.value.length > 10) this.value = this.value.slice(0, 10);
  checkFormValidity();
});

// OTP input: numbers only
const otpInput = document.getElementById("otpInput");
otpInput.addEventListener("input", function() {
  this.value = this.value.replace(/[^0-9]/g, '');
});

// Enable buttons only if all fields valid
const allFields = [
  document.getElementById("firstName"),
  document.getElementById("surname"),
  document.getElementById("age"),
  document.getElementById("dob"),
  document.getElementById("profilePic"),
  document.getElementById("phone"),
  document.getElementById("email")
];
allFields.forEach(field => field.addEventListener("input", () => { 
  checkFormValidity();
  validateAge(); 
}));

// Check form validity
function checkFormValidity(){
  const firstName = document.getElementById("firstName").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const age = document.getElementById("age").value;
  const dob = document.getElementById("dob").value;
  const pic = document.getElementById("profilePic").files.length;
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  const phonePattern = /^[0-9]{10}$/;

  const allValid = firstName && surname && age && dob && pic && phonePattern.test(phone) && emailPattern.test(email);

  document.getElementById("verifyBtn").disabled = !allValid;
  // submitBtn will be enabled only after OTP verification
}

// Profile picture preview
document.getElementById("profilePic").addEventListener("change", function(){
  const preview = document.getElementById("previewPic");
  const file = this.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = () => { 
      preview.src = reader.result; 
      preview.classList.remove("hidden"); 
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.classList.add("hidden");
  }
});

// OTP simulation
document.getElementById("verifyBtn").addEventListener("click", function(){
  document.getElementById("otpSection").classList.remove("hidden");
  showMessage("OTP sent! (Simulated: 1234)", "skyblue");
  document.getElementById("submitBtn").disabled = true; // ensure submit disabled until verification
});

// OTP verification
document.getElementById("submitOtp").addEventListener("click", function(){
  const otp = otpInput.value.trim();
  if(otp === "1234") {
    showMessage("Phone number verified!", "green");
    document.getElementById("submitBtn").disabled = false; // enable submit after OTP
    document.getElementById("verifyBtn").disabled = true;  // disable verify again
    otpInput.disabled = true; // prevent changing OTP after verification
  } else {
    showMessage("Invalid OTP", "red");
    document.getElementById("submitBtn").disabled = true;
  }
});

// Age/DOB validation
function validateAge() {
  const dobValue = document.getElementById("dob").value;
  const ageValue = parseInt(document.getElementById("age").value, 10);

  if (dobValue && ageValue) {
    const dobDate = new Date(dobValue);
    const today = new Date();

    // Rough age calculation
    let calculatedAge = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      calculatedAge--;
    }

    if (calculatedAge !== ageValue) {
      showMessage("Entered age is incorrect.", "orange");
      document.getElementById("verifyBtn").disabled = true;
      document.getElementById("submitBtn").disabled = true;
    } else {
      showMessage("", "green"); // Clear message if age correct
      checkFormValidity(); // Recheck form validity
    }
  }
}

// Form submission
document.getElementById("profileForm").addEventListener("submit", function(e){
  e.preventDefault();
  const firstName = document.getElementById("firstName").value.trim();
  const surname = document.getElementById("surname").value.trim();
  const email = document.getElementById("email").value.trim();

  // Check uniqueness
  const exists = profiles.some(p => p.firstName === firstName && p.surname === surname && p.email === email);
  if(exists){
    showMessage("Profile already exists!", "red");
    return;
  }

  // Save profile
  profiles.push({
    firstName, surname,
    age: document.getElementById("age").value,
    dob: document.getElementById("dob").value,
    phone: document.getElementById("phone").value,
    email,
    profilePic: document.getElementById("profilePic").files[0]
  });

  showMessage("Profile created successfully!", "green");

  // Reset form
  document.getElementById("profileForm").reset();
  document.getElementById("previewPic").src = "";
  document.getElementById("previewPic").classList.add("hidden");
  document.getElementById("verifyBtn").disabled = true;
  document.getElementById("submitBtn").disabled = true;
  document.getElementById("otpSection").classList.add("hidden");
  otpInput.disabled = false; // allow new OTP input for next profile
});

// Show message
function showMessage(msg,color){
  const message = document.getElementById("message");
  message.innerText = msg;
  message.style.color = color;
}
