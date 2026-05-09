/**
 * src/core/components/nav.js
 * Global Navigation Component for Project Kafka
 */

export function renderNav(containerId) {
    const navContainer = document.getElementById(containerId);
    if (!navContainer) return;

    navContainer.innerHTML = `
        <nav class="global-nav">
            <div class="nav-content">
                <div class="nav-logo">Kafka</div>
                <ul class="nav-links">
                    <li><a href="#dashboard" class="nav-item">Dashboard</a></li>
                    <li><a href="#register" class="nav-item">Register</a></li>
                </ul>
            </div>
        </nav>
    `;
}