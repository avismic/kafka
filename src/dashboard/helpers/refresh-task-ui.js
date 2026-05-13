//src/dashboard/helpers/refresh-task-ui.js

import { renderTaskList } from "../components/task-list.js";
import { renderPagination } from "../components/pagination.js";
import { renderTableFilters } from "../components/table-filters.js";
import { state as globalState } from "../../core/state.js";

export function refreshTaskUI(tasks, dashboardState) {
  const currentView = dashboardState.task.view;
  const hotelData = globalState.getHotelData();
  const userRole = (hotelData.userRole || "").toLowerCase().trim();
  const userName = (hotelData.userName || "").trim();

  // 1. Filter logic with Robust Time Archival
  const displayTasks = tasks.filter((t) => {
    // Basic Permissions
    const matchesType =
      dashboardState.task.filters.type === "all" ||
      t.type === dashboardState.task.filters.type;
    const matchesAssigneeSearch = (t.assignee || "")
      .toLowerCase()
      .includes((dashboardState.task.filters.assignee || "").toLowerCase());
    const hasPermission = userRole === "manager" || t.assignee === userName;

    if (!(matchesType && matchesAssigneeSearch && hasPermission)) return false;

    // Time Check Logic
    const now = Date.now();
    // Ensure completed_at is parsed correctly regardless of format
    const completedTime = t.completed_at
      ? new Date(t.completed_at).getTime()
      : null;

    // Calculate if task was finished within the last 24 hours (86,400,000 ms)
    const isRecent = completedTime && now - completedTime < 86400000;

    if (currentView === "pending") {
      // LIVE: Show all tasks still in progress OR completed tasks under 24h old
      return t.status === "pending" || (t.status === "completed" && isRecent);
    } else {
      // HISTORY: Show only tasks that are completed AND older than 24h
      return t.status === "completed" && !isRecent;
    }
  });

  // 2. Sorting Logic: Active Pending -> Recent Completed -> Time Assigned
  let sorted = [...displayTasks].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "pending" ? -1 : 1;
    }
    // Secondary sort: newest assigned task at top of its status group
    return b.id - a.id;
  });

  // 3. UI Component Updates (Filters/Toggle)
  const types = [...new Set(tasks.map((t) => t.type))];
  renderTableFilters(
    "taskFilterContainer",
    { type: types },
    dashboardState.task.filters,
    (key, val) => {
      dashboardState.task.filters[key] = val;
      dashboardState.task.page = 1;
      refreshTaskUI(tasks, dashboardState);
    },
  );

  injectTaskViewToggle(dashboardState, tasks);
  if (userRole === "manager") injectAssigneeFilter(dashboardState, tasks);

  // 4. Final Render
  const { page, size } = dashboardState.task;
  const paginated = sorted.slice((page - 1) * size, page * size);
  renderTaskList("taskListContainer", paginated, userRole, userName);

  renderPagination(
    "taskPaginationContainer",
    { total: sorted.length, current: page, size },
    (p) => {
      dashboardState.task.page = p;
      refreshTaskUI(tasks, dashboardState);
    },
    (s) => {
      dashboardState.task.size = s;
      dashboardState.task.page = 1;
      refreshTaskUI(tasks, dashboardState);
    },
  );

  document.getElementById("taskActiveCount").textContent =
    `${sorted.length} ${currentView === "pending" ? "Live" : "Archived"}`;
}

function injectTaskViewToggle(dashboardState, tasks) {
  const container = document.querySelector("#taskSection .section-header");
  if (!container || document.getElementById("taskViewToggle")) return;

  const toggleHtml = `
        <div class="segmented-control" id="taskViewToggle" style="margin-left: 20px;">
            <button class="${dashboardState.task.view === "pending" ? "active" : ""}" data-view="pending">Live</button>
            <button class="${dashboardState.task.view === "completed" ? "active" : ""}" data-view="completed">History</button>
        </div>
    `;
  container.insertAdjacentHTML("beforeend", toggleHtml);

  document.getElementById("taskViewToggle").onclick = (e) => {
    if (e.target.tagName === "BUTTON") {
      dashboardState.task.view = e.target.dataset.view;
      dashboardState.task.page = 1;
      // Clean up old toggle before re-render
      document.getElementById("taskViewToggle").remove();
      document
        .getElementById("assigneeSearch")
        ?.closest(".filter-group")
        ?.remove();
      refreshTaskUI(tasks, dashboardState);
    }
  };
}

function injectAssigneeFilter(dashboardState, tasks) {
  const filterBar = document.querySelector(
    "#taskFilterContainer .table-filters",
  );
  if (!filterBar || document.getElementById("assigneeSearch")) return;

  const group = document.createElement("div");
  group.className = "filter-group";
  group.innerHTML = `
        <label>Assignee</label>
        <input type="text" id="assigneeSearch" class="filter-select" 
               placeholder="Search name..." value="${dashboardState.task.filters.assignee}"
               style="min-width: 150px;">
    `;

  filterBar.appendChild(group);

  const input = document.getElementById("assigneeSearch");

  input.oninput = (e) => {
    // 1. Save the current cursor position to prevent jumping
    const cursorPosition = e.target.selectionStart;

    dashboardState.task.filters.assignee = e.target.value;
    dashboardState.task.page = 1;

    // 2. Refresh the UI
    refreshTaskUI(tasks, dashboardState);

    // 3. Restore focus and cursor position
    const newInput = document.getElementById("assigneeSearch");
    if (newInput) {
      newInput.focus();
      newInput.setSelectionRange(cursorPosition, cursorPosition);
    }
  };
}
