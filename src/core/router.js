/**
 * src/core/router.js
 * Minimalist Hash-based Router for Project Kafka
 */
import { initRegister } from '../register/register.js';
// 1. IMPORT the real dashboard module
import { initDashboard } from '../dashboard/dashboard.js'; 
import { initLogin } from '../login/login.js';
import { initSettings } from '../settings/settings.js';

const routes = {
    '': initRegister,
    '#register': initRegister,
    '#dashboard': initDashboard,
    '#login': initLogin,
    '#settings': initSettings,
};

export function handleRoute() {
    const hash = window.location.hash;
    const routeAction = routes[hash] || routes[''];
    
    const app = document.getElementById('app');
    app.style.opacity = '0';
    
    setTimeout(() => {
        routeAction('app');
        app.style.opacity = '1';
    }, 200);
}

window.addEventListener('hashchange', handleRoute);