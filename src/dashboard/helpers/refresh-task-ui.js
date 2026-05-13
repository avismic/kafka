//src/dashboard/helpers/refresh-task-ui.js

import { renderTaskList } from "../components/task-list.js";
import { renderPagination } from "../components/pagination.js";
import { renderTableFilters } from "../components/table-filters.js";
import { state as globalState } from "../../core/state.js";

export function refreshTaskUI(tasks, dashboardState) {
  const currentView = dashboardState.task.view;

  // 1. Context check with debug logs
  const hotelData = globalState.getHotelData();

  // Normalize values to prevent case-sensitivity bugs
  const userRole = (hotelData.userRole || "").toLowerCase().trim();
  const userName = (hotelData.userName || "").trim();

  console.log(`[Permission Check] User: ${userName}, Role: ${userRole}`);

  // 2. Filter logic
  const displayTasks = tasks.filter((t) => {
    const matchesStatus = t.status === currentView;
    const matchesType =
      dashboardState.task.filters.type === "all" ||
      t.type === dashboardState.task.filters.type;

    const matchesAssigneeSearch = (t.assignee || "")
      .toLowerCase()
      .includes((dashboardState.task.filters.assignee || "").toLowerCase());

    // ROLE VISIBILITY LOGIC
    // Using normalized 'userRole' for safety
    const hasPermission = userRole === "manager" || t.assignee === userName;

    // DEBUG: If you are a manager but tasks are missing, check this log:
    if (userRole === "manager" && !hasPermission) {
      console.warn(
        `Manager check failed for task ID: ${t.id}. Role detected as: '${userRole}'`,
      );
    }

    return (
      matchesStatus && matchesType && matchesAssigneeSearch && hasPermission
    );
  });

  // ... (rest of the sorting and rendering logic remains the same)
  let sorted = [...displayTasks].sort((a, b) => b.id - a.id);

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

  // Only managers get the search-by-assignee input
  if (userRole === "manager") {
    injectAssigneeFilter(dashboardState, tasks);
  }

  const { page, size } = dashboardState.task;
  const paginated = sorted.slice((page - 1) * size, page * size);
  renderTaskList("taskListContainer", paginated);

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
    `${sorted.length} ${currentView === "pending" ? "Active" : "Archived"}`;
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
