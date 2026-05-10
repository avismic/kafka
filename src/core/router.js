//src/core/router.js

import { initRegister } from '../register/register.js';
import { initDashboard } from '../dashboard/dashboard.js'; 
import { initLogin } from '../login/login.js';
import { initSettings } from '../settings/settings.js';
import { initTasks } from '../tasks/tasks.js';

const routes = {
    '': initRegister,
    '#register': initRegister,
    '#dashboard': initDashboard,
    '#login': initLogin,
    '#settings': initSettings,
    '#assign-task': initTasks,
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