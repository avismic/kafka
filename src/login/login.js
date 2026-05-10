/**
 * src/login/login.js
 * Main Controller for Kafka Login Feature
 */

import { api } from "../core/api.js"; // 1. Add this import at the top
import { state as globalState } from "../core/state.js";

export function initLogin(containerId) {
  const app = document.getElementById(containerId);

  app.innerHTML = `
        <div class="login-container">
            <header class="login-header">
                <h1>Kafka Login</h1>
                <p>Access your hotel management suite.</p>
            </header>
            
            <form id="loginForm" class="login-form">
                <div class="form-group">
                    <label>EMAIL</label>
                    <input type="email" id="loginEmail" placeholder="manager@hotel.com" required>
                </div>
                <div class="form-group">
                    <label>PASSWORD</label>
                    <input type="password" id="loginPassword" placeholder="••••••••" required>
                </div>
                <button type="submit" class="login-btn">Sign In</button>
            </form>
            
            <footer class="login-footer">
                <p>New to Kafka? <a href="#register">Register your hotel</a></p>
            </footer>
        </div>
    `;

  bindLoginEvents();
}

function bindLoginEvents() {
  const form = document.getElementById("loginForm");

  form.onsubmit = async (e) => {
    e.preventDefault();

    const credentials = {
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    };

    try {
      // 2. Call our centralized API service
      const response = await api.auth.login(credentials);

      // 3. Securely store the JWT and Hotel metadata
      localStorage.setItem("kafka_auth_token", response.token);

      globalState.saveHotelData({
        hotelName: response.hotelName,
        isLoggedIn: true,
      });

      console.log("Login successful. Token stored.");

      // 4. Redirect to the secure Dashboard
      window.location.hash = "#dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      alert(`Authentication Error: ${error.message}`);
    }
  };
}
