/**
 * src/dashboard/dashboard.js
 * Feature Controller for Kafka Management Dashboard
 * Handles dynamic updates for both Employees and Rooms.
 */
import { state as globalState } from "../core/state.js";
import { renderEmployeeList } from "./components/employee-list.js";
import { renderRoomList } from "./components/room-list.js";
import { renderSearchBar } from "./components/search-bar.js";
import { renderPagination } from "./components/pagination.js";
import { renderTableFilters } from "./components/table-filters.js";


const dashboardState = {
  employee: { page: 1, size: 5, filters: { role: "all" } },
  room: { page: 1, size: 5, filters: { type: "all", status: "all" } },
  searchQuery: "",
};

export function initDashboard(containerId) {
  const app = document.getElementById(containerId);
  const data = globalState.getHotelData();

  app.innerHTML = `
        <div class="dashboard-container">
            <header class="dashboard-header">
                <h1>${data.hotelName || "Hotel"} Dashboard</h1>
                <p>Welcome to your Kafka Management Suite.</p>
            </header>
            <div id="searchBarContainer"></div>
            
            <div class="dashboard-grid">
                <div class="stats-card">
                    <h3>Total Employees</h3>
                    <p class="stat-value" id="empStatCount">${data.employeeCount || "0"}</p>
                </div>
                <div class="stats-card">
                    <h3>Active Rooms</h3>
                    <p class="stat-value" id="roomStatCount">${data.roomCount || "0"}</p>
                </div>
            </div>

            <section id="employeeSection">
                <div class="section-header">
                    <h2>Employee Records</h2>
                    <label for="updateEmpInput" class="update-btn">Update List</label>
                    <input type="file" id="updateEmpInput" accept=".csv" hidden>
                </div>
                <div id="empFilterContainer"></div>
                <div id="employeeListContainer"></div>
                <div id="empPaginationContainer"></div>
            </section>

            <section id="roomSection">
                <div class="section-header">
                    <h2>Room Records</h2>
                    <label for="updateRoomInput" class="update-btn">Update Rooms</label>
                    <input type="file" id="updateRoomInput" accept=".csv" hidden>
                </div>
                <div id="roomFilterContainer"></div>
                <div id="roomListContainer"></div>
                <div id="roomPaginationContainer"></div>
            </section>
        </div>
    `;

  // 1. Initial Render from stored data
  refreshEmployeeUI(data.employeeRawData || "");
  refreshRoomUI(data.roomRawData || "");

  // 2. Bind Employee Update Event
  document.getElementById("updateEmpInput").addEventListener("change", (e) => {
    handleFileUpdate(e.target.files[0], "employee");
  });

  // 3. Bind Room Update Event
  document.getElementById("updateRoomInput").addEventListener("change", (e) => {
    handleFileUpdate(e.target.files[0], "room");
  });

  // Initialize Search
  renderSearchBar("searchBarContainer", (query) => {

    // 1. Update the global search query
    dashboardState.searchQuery = query.toLowerCase();

    // 2. Reset pages to 1 when searching
    dashboardState.employee.page = 1;
    dashboardState.room.page = 1;

    // 3. Trigger unified refresh
    const currentData = globalState.getHotelData();
    refreshEmployeeUI(currentData.employeeRawData || "");
    refreshRoomUI(currentData.roomRawData || "");
  });
}

function handleFileUpdate(file, type) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const content = event.target.result;

    if (type === "employee") {
      const employees = parseEmployeeCSV(content);
      refreshEmployeeUI(content);
      globalState.saveHotelData({
        employeeRawData: content,
        employeeCount: employees.length,
      });
      document.getElementById("empStatCount").textContent = employees.length;
    } else {
      const rooms = parseRoomCSV(content);
      refreshRoomUI(content);
      globalState.saveHotelData({
        roomRawData: content,
        roomCount: rooms.length,
      });
      document.getElementById("roomStatCount").textContent = rooms.length;
    }
  };
  reader.readAsText(file);
}

// Example for Employee Refresh
function refreshEmployeeUI(csvData) {
  const all = parseEmployeeCSV(csvData);

  // 1. Get Unique Filter Options
  const roles = [...new Set(all.map((e) => e.role))];

  // 2. Apply Unified Filtering (Search + Selectors)
  const filtered = all.filter((e) => {
    const matchesSearch = Object.values(e).some((val) =>
      val?.toString().toLowerCase().includes(dashboardState.searchQuery),
    );

    const matchesRole =
      dashboardState.employee.filters.role === "all" ||
      e.role === dashboardState.employee.filters.role;

    return matchesSearch && matchesRole;
  });

  // 3. Render Components
  renderTableFilters(
    "empFilterContainer",
    { role: roles }, // Argument 2: Available options
    { role: dashboardState.employee.filters.role }, // Argument 3: Active state
    (key, val) => {
      // Argument 4: Callback logic
      dashboardState.employee.filters[key] = val;
      dashboardState.employee.page = 1;
      refreshEmployeeUI(csvData);
    },
  );

  const { page, size } = dashboardState.employee;
  const paginated = filtered.slice((page - 1) * size, page * size);
  renderEmployeeList("employeeListContainer", paginated);
  renderPagination(
    "empPaginationContainer",
    { total: filtered.length, current: page, size },
    (p) => {
      dashboardState.employee.page = p;
      refreshEmployeeUI(csvData);
    },
    (s) => {
      dashboardState.employee.size = s;
      dashboardState.employee.page = 1;
      refreshEmployeeUI(csvData);
    },
  );
}

/**
 * Unified Refresh logic for Room Records (Search + Filter + Pagination)
 */
function refreshRoomUI(csvData) {
  const all = parseRoomCSV(csvData);

  // 1. Extract Unique Values for Dynamic Filters [cite: 532]
  const types = [...new Set(all.map((r) => r.type))];
  const statuses = [...new Set(all.map((r) => r.status))];

  // 2. Multi-Layered Filtering Pass [cite: 534, 536]
  const filtered = all.filter((r) => {
    const matchesSearch = Object.values(r).some((v) =>
      v.toLowerCase().includes(dashboardState.searchQuery),
    );
    const matchesType =
      dashboardState.room.filters.type === "all" ||
      r.type === dashboardState.room.filters.type;
    const matchesStatus =
      dashboardState.room.filters.status === "all" ||
      r.status === dashboardState.room.filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  // 3. Render Top Filter Component [cite: 532, 535]
  // Pass the current room filter state
  renderTableFilters(
    "roomFilterContainer",
    { type: types, status: statuses },
    dashboardState.room.filters,
    (key, val) => {
      dashboardState.room.filters[key] = val;
      dashboardState.room.page = 1;
      refreshRoomUI(csvData);
    },
  );

  // 4. Handle Pagination Slicing [cite: 464, 534]
  const { page, size } = dashboardState.room;
  const paginated = filtered.slice((page - 1) * size, page * size);

  renderRoomList("roomListContainer", paginated);

  // 5. Render Bottom Pagination Component [cite: 459, 464]
  renderPagination(
    "roomPaginationContainer",
    { total: filtered.length, current: page, size },
    (p) => {
      dashboardState.room.page = p;
      refreshRoomUI(csvData);
    },
    (s) => {
      dashboardState.room.size = s;
      dashboardState.room.page = 1;
      refreshRoomUI(csvData);
    },
  );
}

function parseEmployeeCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.trim().split("\n");
  return lines.slice(1).map((line) => {
    const v = line.split(",").map((item) => item.trim());
    return { name: v[0], email: v[1], role: v[2], dept: v[3] };
  });
}

function parseRoomCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.trim().split("\n");
  return lines.slice(1).map((line) => {
    const v = line.split(",").map((item) => item.trim());
    return { number: v[0], type: v[1], status: v[2], lastCleaned: v[3] };
  });
}

/**
 * Update a specific record in the local data and save to state
 */
function updateRecord(type, index, updatedRowArray) {
  const data = globalState.getHotelData();

  // Explicitly determine which key to use based on the validated type
  const storageKey = type === "employee" ? "employeeRawData" : "roomRawData";
  let rawData = data[storageKey];

  if (!rawData) return;

  const lines = rawData.trim().split("\n");
  const headers = lines[0];
  const records = lines.slice(1);

  // Update only the targeted record [cite: 9]
  records[index] = updatedRowArray.join(", ");

  const newRawData = [headers, ...records].join("\n");

  const updateObj = {};
  updateObj[storageKey] = newRawData;

  globalState.saveHotelData(updateObj);
}

/**
 * src/dashboard/dashboard.js
 * Enhanced Inline Edit Handler with Context-Aware Dropdowns for Employees & Rooms
 */
window.handleEdit = function (btn, index, type) {
  const row = btn.closest("tr");
  const cells = row.querySelectorAll("td:not(.actions-cell)");
  const isEditing = btn.textContent === "Save";
  const data = globalState.getHotelData();

  if (!isEditing) {
    // 1. Extract unique values for dynamic dropdowns
    // For Employees
    const allEmployees = parseEmployeeCSV(data.employeeRawData || "");
    const roles = [...new Set(allEmployees.map((e) => e.role))];
    const depts = [...new Set(allEmployees.map((e) => e.dept))];

    // For Rooms
    const allRooms = parseRoomCSV(data.roomRawData || "");
    const roomTypes = [...new Set(allRooms.map((r) => r.type))];
    const roomStatuses = [...new Set(allRooms.map((r) => r.status))];

    // 2. Switch to Edit Mode with specific Input/Select Logic
    /**
     * src/dashboard/dashboard.js
     * Fixed mapping for streamlined Role-only Employee table
     */
    cells.forEach((cell, cellIndex) => {
      const currentText = cell.textContent.trim();

      // Updated Mapping Logic for Role-Only View
      if (type === "employee" && cellIndex === 2) {
        // FIX: In a 4-column layout, Role is now strictly at index 2
        cell.innerHTML = `
      <select class="editing-input">
        ${roles.map((opt) => `<option value="${opt}" ${opt === currentText ? "selected" : ""}>${opt}</option>`).join("")}
      </select>`;
      } else if (type === "room" && (cellIndex === 1 || cellIndex === 2)) {
        // Room Mapping remains: 1:Type, 2:Status
        const options = cellIndex === 1 ? roomTypes : roomStatuses;
        cell.innerHTML = `
      <select class="editing-input">
        ${options.map((opt) => `<option value="${opt}" ${opt === currentText ? "selected" : ""}>${opt}</option>`).join("")}
      </select>`;
      } else {
        // Standard text input for Name (0) and Email (1)
        cell.innerHTML = `<input type="text" class="editing-input" value="${currentText}">`;
      }
    });

    btn.textContent = "Save";
    btn.classList.add("save-active");
  } else {
    // 3. Execute Save Logic
    const inputs = row.querySelectorAll(".editing-input");
    const updatedRow = Array.from(inputs).map((input) => input.value);

    updateRecord(type, index, updatedRow);

    // 4. Refresh UI from updated state
    const currentData = globalState.getHotelData();
    if (type === "employee") {
      refreshEmployeeUI(currentData.employeeRawData);
    } else {
      refreshRoomUI(currentData.roomRawData);
    }
  }
};

/**
 * Two-stage deletion logic for a smoother, non-intrusive UI experience.
 */
window.handleDeleteEmployee = function (btn, index) {
  const isPrimed = btn.classList.contains("delete-primed");

  if (!isPrimed) {
    // Stage 1: Prime the button
    btn.textContent = "Sure?";
    btn.classList.add("delete-primed");

    // Reset after 3 seconds if not confirmed
    setTimeout(() => {
      if (btn) {
        btn.textContent = "Delete";
        btn.classList.remove("delete-primed");
      }
    }, 3000);
    return;
  }

  // Stage 2: Confirmed Deletion
  const data = globalState.getHotelData();
  let rawData = data.employeeRawData;
  if (!rawData) return;

  const lines = rawData.trim().split("\n");
  const headers = lines[0];
  const records = lines.slice(1);

  records.splice(index, 1);

  const newRawData = [headers, ...records].join("\n");

  globalState.saveHotelData({
    employeeRawData: newRawData,
    employeeCount: records.length,
  });

  document.getElementById("empStatCount").textContent = records.length;
  refreshEmployeeUI(newRawData);
};
