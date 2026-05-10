/**
 * src/core/utils.js
 * Minimalist Toast Notification Utility
 */
export function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.className = "kafka-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 10);

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
