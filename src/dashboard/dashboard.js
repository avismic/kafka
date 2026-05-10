//src/dashboard/dashboard.js

import { api } from "../core/api.js";
import { state as globalState } from "../core/state.js";
import { bindDashboardEvents } from "./helpers/bind-dashboard-events.js";
import { showToast } from "../core/utils.js";
import { handleDeleteEmployee } from "./helpers/handle-delete-employee.js";
import { handleEdit } from "./helpers/handle-edit.js";
import { refreshEmployeeUI } from "./helpers/refresh-employee-ui.js";
import { refreshRoomUI } from "./helpers/refresh-room-ui.js";
import { renderDashboardShell } from "./helpers/render-dashboard-shell.js";

const dashboardState = {
  employee: { page: 1, size: 5, filters: { role: "all" } },
  room: { page: 1, size: 5, filters: { type: "all", status: "all" } },
  searchQuery: "",
};

export async function initDashboard(containerId) {
  const app = document.getElementById(containerId);
  try {
    const data = await api.request("/auth/me");
    globalState.saveHotelData({
      hotelName: data.hotelName,
      employees: data.employees,
      rooms: data.rooms,
    });

    renderDashboardShell(
      app,
      data.hotelName,
      data.employees.length,
      data.rooms.length,
    );
    refreshEmployeeUI(data.employees, dashboardState);
    refreshRoomUI(data.rooms, dashboardState);
    bindDashboardEvents(data, dashboardState);
  } catch (error) {
    console.error("Dashboard failed to load:", error);
    window.location.hash = "#login"; // Redirect if unauthorized
  }
}

window.handleEdit = (btn, index, type) =>
  handleEdit(btn, index, type, () => initDashboard("app"));
window.handleDeleteEmployee = (btn, index) =>
  handleDeleteEmployee(btn, index, () => initDashboard("app"));
