/**
 * src/register/register.js
 * Feature Controller for multi-step registration (Project Kafka)
 */

import { renderExcelUpload } from "./components/excel-upload.js";
import { state as globalState } from "../core/state.js";

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
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const hotelDetails = Object.fromEntries(formData);

    // Save both form fields AND the parsed CSV content
    hotelDetails.employeeRawData = window.tempCSVData || "";
    globalState.saveHotelData(hotelDetails);

    const app = document.getElementById(containerId);
    app.style.opacity = "0";

    setTimeout(() => {
      alert("Registration Complete.");
      window.location.hash = "#dashboard";
    }, 300);
  });
}
