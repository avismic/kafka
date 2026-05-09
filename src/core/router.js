/**
 * src/core/router.js
 * Minimalist Hash-based Router for Project Kafka
 */
import { initRegister } from '../register/register.js';
// 1. IMPORT the real dashboard module
import { initDashboard } from '../dashboard/dashboard.js'; 

const routes = {
    '': initRegister,
    '#register': initRegister,
    // 2. UPDATE this line to use the imported function
    '#dashboard': initDashboard 
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