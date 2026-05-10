/**
 * src/settings/settings.js
 * Feature Controller for Project Kafka Settings & Logout
 */
import { state as globalState } from "../core/state.js";

export function initSettings(containerId) {
    const app = document.getElementById(containerId);
    const data = globalState.getHotelData();

    app.innerHTML = `
        <div class="settings-container">
            <header class="settings-header">
                <h1>Application Settings</h1>
                <p>Manage your local environment and account state.</p>
            </header>

            <section class="settings-section">
                <div class="setting-item">
                    <div class="setting-info">
                        <h3>Hotel Profile</h3>
                        <p>Current active hotel: <strong>${data.hotelName || 'None'}</strong></p>
                    </div>
                </div>

                <div class="setting-item critical">
                    <div class="setting-info">
                        <h3>Logout & Reset</h3>
                        <p>This will clear all local data and return you to the login screen.</p>
                    </div>
                    <button id="logoutBtn" class="logout-btn">Log Out</button>
                </div>
            </section>
        </div>
    `;

    bindSettingsEvents();
}

function bindSettingsEvents() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.onclick = () => {
        // 1. Clear persistent localStorage
        localStorage.clear();
        
        // 2. Clear global in-memory state
        globalState.saveHotelData({}); 
        
        // 3. Apple-style graceful redirect
        window.location.hash = '#login';
        
        // 4. Force reload to ensure a fresh app state
        window.location.reload();
    };
}