/**
 * Project Kafka - Core Application Entry
 * Handles Service Worker registration and Module mounting.
 */
import { handleRoute } from "./router.js";
import { renderNav } from './components/nav.js';

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.error("SW failed:", error);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  registerServiceWorker();
  handleRoute(); // Initialize the first route
  renderNav('global-nav-container');
});
