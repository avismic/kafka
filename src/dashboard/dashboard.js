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
import { renderTaskList } from "./components/task-list.js";
import { refreshTaskUI } from "./helpers/refresh-task-ui.js";
import { handleCompleteTask } from "./helpers/handle-complete-task.js";

const dashboardState = {
  employee: { page: 1, size: 5, filters: { role: "all" } },
  room: { page: 1, size: 5, filters: { type: "all", status: "all" } },
  task: { page: 1, size: 5, filters: { type: "all", assignee: "" }, view: "pending" },
  searchQuery: "",
};

export async function initDashboard(containerId) {
  const app = document.getElementById(containerId);
  try {
    // 1. Parallel Fetch: Profile and Tasks
    const [meData, taskData] = await Promise.all([
      api.request("/auth/me"),
      api.request("/data/tasks"),
    ]);

    // 2. Global State Sync
    globalState.saveHotelData({
      hotelName: meData.hotelName,
      employees: meData.employees,
      rooms: meData.rooms,
      liveTasks: taskData,
    });

    // 3. Structural Render (Only call this ONCE)
    renderDashboardShell(
      app,
      meData.hotelName,
      meData.employees.length,
      meData.rooms.length,
    );

    // 4. Component Refresh (UI Layer)
    refreshTaskUI(taskData, dashboardState);
    refreshEmployeeUI(meData.employees, dashboardState);
    refreshRoomUI(meData.rooms, dashboardState);

    // 5. Event Binding
    bindDashboardEvents(meData, dashboardState);
  } catch (error) {
    console.error("Dashboard failed to load:", error);
    window.location.hash = "#login";
  }
}

window.handleEdit = (btn, index, type) =>
  handleEdit(btn, index, type, () => initDashboard("app"));
window.handleDeleteEmployee = (btn, index) =>
  handleDeleteEmployee(btn, index, () => initDashboard("app"));
window.handleCompleteTask = (taskId) => {
  handleCompleteTask(taskId, (updatedTasks) => {
    refreshTaskUI(updatedTasks, dashboardState);
  });
};
