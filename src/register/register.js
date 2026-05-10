/**
 * src/register/register.js
 * Feature Controller for multi-step registration (Project Kafka)
 */

import { renderExcelUpload } from "./components/excel-upload.js";
import { state as globalState } from "../core/state.js";
import { api } from "../core/api.js";

const state = {
  currentStep: 1,
  formData: {},
};

// Hardcoded OTP for development
const DEV_OTP = "123456";

export function initRegister(containerId) {
  renderStep(containerId);
}

function renderStep(containerId) {
  const app = document.getElementById(containerId);

  switch (state.currentStep) {
    case 1:
      app.innerHTML = getHotelBasicInfoTemplate();
      bindStep1Events(containerId);
      break;
    case 2:
      app.innerHTML = getOTPTemplate();
      bindStep2Events(containerId);
      break;
    case 3:
      app.innerHTML = getExtendedInfoTemplate();
      renderExcelUpload("fileUploadContainer");
      bindStep3Events(containerId);
      break;
  }
}

/* Templates */

function getHotelBasicInfoTemplate() {
  return `
        <div class="register-container">
            <h1 class="register-title">Register Hotel</h1>
            <form class="register-form" id="registerForm">
                <input type="text" name="hotelName" placeholder="Hotel Name" required>
                <input type="email" name="email" placeholder="Business Email" required>
                <input type="tel" name="phone" placeholder="Phone Number" required>
                <input type="password" name="password" placeholder="Password" required>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
                <button type="submit" class="register-button">Next</button>
            </form>
        </div>`;
}

function getOTPTemplate() {
  return `
        <div class="register-container">
            <h1 class="register-title">Verify OTP</h1>
            <p style="text-align:center; color:var(--color-subtext)">Use code: <strong>123456</strong></p>
            <div class="register-form">
                <input type="text" id="otpInput" placeholder="Enter 6-digit OTP" maxlength="6">
                <button class="register-button" id="verifyOtpBtn">Verify & Continue</button>
            </div>
        </div>`;
}

function getExtendedInfoTemplate() {
  return `
        <div class="register-container">
            <h1 class="register-title">Hotel Details</h1>
            <form class="register-form" id="extendedInfoForm">
                <input type="number" name="employeeCount" placeholder="Number of Employees" required>
                <input type="number" name="roomCount" placeholder="Number of Rooms" required>
                <div id="fileUploadContainer"></div> <button type="submit" class="register-button">Complete Registration</button>
            </form>
        </div>`;
}

/* Event Bindings */

function bindStep1Events(containerId) {
  const form = document.getElementById("registerForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (form.password.value !== form.confirmPassword.value) {
      alert("Passwords do not match");
      return;
    }

    // Save data from Step 1 into state
    const formData = new FormData(form);
    state.formData = Object.fromEntries(formData);

    state.currentStep = 2;
    renderStep(containerId);
  });
}

function bindStep2Events(containerId) {
  document.getElementById("verifyOtpBtn").addEventListener("click", () => {
    const otp = document.getElementById("otpInput").value;
    if (otp === DEV_OTP) {
      state.currentStep = 3;
      renderStep(containerId);
    } else {
      alert("Invalid OTP. Hint: 123456");
    }
  });
}

function bindStep3Events(containerId) {
  const form = document.getElementById("extendedInfoForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const hotelDetails = Object.fromEntries(formData);

    // Ensure 'hotelName' from form maps to 'name' for the database
    const finalPayload = {
      name: state.formData.hotelName, // Map hotelName to name
      email: state.formData.email,
      password: state.formData.password,
      phone: state.formData.phone,
      employeeCount: hotelDetails.employeeCount,
      roomCount: hotelDetails.roomCount,
    };

    try {
      const response = await api.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(finalPayload),
      });

      console.log("Server Registration Success:", response);

      const app = document.getElementById(containerId);
      app.style.opacity = "0";

      setTimeout(() => {
        alert("Registration Complete. Welcome to Kafka.");
        window.location.hash = "#login"; // Redirect to login now that we have a database
      }, 300);
    } catch (error) {
      console.error("Registration failed:", error);
      alert(`Registration Error: ${error.message}`);
    }
  });
}
