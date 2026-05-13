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
                    <input type="text" id="loginEmail" placeholder="Email or Employee Code" required>
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
      // This 'email' key is what the backend uses as the universal identifier
      email: document.getElementById("loginEmail").value,
      password: document.getElementById("loginPassword").value,
    };

    try {
      const response = await api.auth.login(credentials);

      // 1. Store the token with the key expected by your API service
      localStorage.setItem("kafka_auth_token", response.token);

      // 2. Store the role and name for UI logic
      localStorage.setItem("userRole", response.role);
      localStorage.setItem("userName", response.name);

      // 3. Update global state
      globalState.saveHotelData({
        userName: response.name,
        userRole: response.role,
        isLoggedIn: true,
      });

      console.log(`${response.role} login successful.`);

      // 4. Redirect to Dashboard
      window.location.hash = "#dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      alert(`Authentication Error: ${error.message}`);
    }
  };
}
