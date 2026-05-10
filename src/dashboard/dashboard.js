/**
 * src/dashboard/dashboard.js
 * Feature Controller for Kafka Management Dashboard
 * Handles dynamic updates for both Employees and Rooms.
 */
import { renderEmployeeList } from "./components/employee-list.js";
import { renderRoomList } from "./components/room-list.js";
import { renderSearchBar } from "./components/search-bar.js";
import { renderPagination } from "./components/pagination.js";
import { renderTableFilters } from "./components/table-filters.js";
import { api } from "../core/api.js";
import { state as globalState } from "../core/state.js";
import { showToast } from "../core/utils.js";

const dashboardState = {
  employee: { page: 1, size: 5, filters: { role: "all" } },
  room: { page: 1, size: 5, filters: { type: "all", status: "all" } },
  searchQuery: "",
};

export async function initDashboard(containerId) {
  const app = document.getElementById(containerId);

  try {
    // 1. Fetch real hotel data using the JWT in localStorage
    const data = await api.request("/auth/me");

    // 2. Update global state with fresh server data
    globalState.saveHotelData({
      hotelName: data.hotelName,
      employees: data.employees,
      rooms: data.rooms,
    });

    // 3. Render the Dashboard Shell
    app.innerHTML = `
        <div class="dashboard-container">
            <header class="dashboard-header">
                <h1>${data.hotelName} Dashboard</h1>
                <p>Welcome to your Kafka Management Suite.</p>
            </header>
            <div id="searchBarContainer"></div>
            
            <div class="dashboard-grid">
                <div class="stats-card">
                    <h3>Total Employees</h3>
                    <p class="stat-value" id="empStatCount">${data.employees.length}</p>
                </div>
                <div class="stats-card">
                    <h3>Active Rooms</h3>
                    <p class="stat-value" id="roomStatCount">${data.rooms.length}</p>
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

    // 4. Initial Render using fetched records
    refreshEmployeeUI(data.employees);
    refreshRoomUI(data.rooms);

    // 5. Re-bind search and file update events
    bindDashboardEvents(data);
  } catch (error) {
    console.error("Dashboard failed to load:", error);
    window.location.hash = "#login"; // Redirect if unauthorized
  }
}

async function handleFileUpdate(file, type) {
  if (!file) return;
  const reader = new FileReader();

  reader.onload = async (event) => {
    const content = event.target.result;

    try {
      if (type === "employee") {
        const employees = parseEmployeeCSV(content);

        // 1. Sync with Neon Database
        await api.request("/data/employees/bulk", {
          method: "POST",
          body: JSON.stringify({ employees }),
        });

        // 2. Refresh UI
        refreshEmployeeUI(employees);
        document.getElementById("empStatCount").textContent = employees.length;
        showToast("Employee records synced to cloud.");
      } else if (type === "room") {
        const rooms = parseRoomCSV(content);

        // 1. Sync Rooms with Neon
        await api.request("/data/rooms/bulk", {
          method: "POST",
          body: JSON.stringify({ rooms }),
        });

        // 2. Refresh UI
        refreshRoomUI(rooms);
        document.getElementById("roomStatCount").textContent = rooms.length;
        showToast("Room records synced to cloud.");
      }
    } catch (error) {
      console.error(`Sync failed for ${type}:`, error);
      alert(`Sync failed: ${error.message}`);
    }
  };
  reader.readAsText(file);
}

/**
 * src/dashboard/dashboard.js
 * Precision Update: Type-safe searching for Database Records
 */

function refreshEmployeeUI(data) {
  const all = Array.isArray(data) ? data : parseEmployeeCSV(data);
  const roles = [...new Set(all.map((e) => e.role))];

  const filtered = all.filter((e) => {
    // FIX: Ensure val is converted to string and checked for existence [cite: 1616]
    const matchesSearch = Object.values(e).some((val) =>
      val?.toString().toLowerCase().includes(dashboardState.searchQuery),
    );

    const matchesRole =
      dashboardState.employee.filters.role === "all" ||
      e.role === dashboardState.employee.filters.role;

    return matchesSearch && matchesRole;
  });

  // ... (rest of the render logic remains the same)
  renderTableFilters(
    "empFilterContainer",
    { role: roles },
    { role: dashboardState.employee.filters.role },
    (key, val) => {
      dashboardState.employee.filters[key] = val;
      dashboardState.employee.page = 1;
      refreshEmployeeUI(data);
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
      refreshEmployeeUI(data);
    },
    (s) => {
      dashboardState.employee.size = s;
      dashboardState.employee.page = 1;
      refreshEmployeeUI(data);
    },
  );
}

function refreshRoomUI(data) {
  const all = Array.isArray(data) ? data : parseRoomCSV(data);
  const types = [...new Set(all.map((r) => r.type))];
  const statuses = [...new Set(all.map((r) => r.status))];

  const filtered = all.filter((r) => {
    // FIX: Safely handle nulls and non-string types like last_cleaned dates [cite: 1622]
    const matchesSearch = Object.values(r).some((v) =>
      v !== null && v !== undefined
        ? v.toString().toLowerCase().includes(dashboardState.searchQuery)
        : false,
    );

    const matchesType =
      dashboardState.room.filters.type === "all" ||
      r.type === dashboardState.room.filters.type;
    const matchesStatus =
      dashboardState.room.filters.status === "all" ||
      r.status === dashboardState.room.filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  // ... (rest of the render logic remains the same)
  renderTableFilters(
    "roomFilterContainer",
    { type: types, status: statuses },
    dashboardState.room.filters,
    (key, val) => {
      dashboardState.room.filters[key] = val;
      dashboardState.room.page = 1;
      refreshRoomUI(data);
    },
  );

  const { page, size } = dashboardState.room;
  const paginated = filtered.slice((page - 1) * size, page * size);
  renderRoomList("roomListContainer", paginated);
  renderPagination(
    "roomPaginationContainer",
    { total: filtered.length, current: page, size },
    (p) => {
      dashboardState.room.page = p;
      refreshRoomUI(data);
    },
    (s) => {
      dashboardState.room.size = s;
      dashboardState.room.page = 1;
      refreshRoomUI(data);
    },
  );
}

function bindDashboardEvents(data) {
  document.getElementById("updateEmpInput").onchange = (e) =>
    handleFileUpdate(e.target.files[0], "employee");
  document.getElementById("updateRoomInput").onchange = (e) =>
    handleFileUpdate(e.target.files[0], "room");

  renderSearchBar("searchBarContainer", (query) => {
    dashboardState.searchQuery = query.toLowerCase();
    dashboardState.employee.page = 1;
    dashboardState.room.page = 1;
    refreshEmployeeUI(data.employees);
    refreshRoomUI(data.rooms);
  });
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

window.handleEdit = async function (btn, index, type) {
  const row = btn.closest("tr");
  const cells = row.querySelectorAll("td:not(.actions-cell)");
  const isEditing = btn.textContent === "Save";
  const data = globalState.getHotelData();

  if (!isEditing) {
    // 1. Extract unique values for dynamic dropdowns
    // For Employees
    const currentData = globalState.getHotelData();
    const allEmployees = currentData.employees || [];
    const roles = [...new Set(allEmployees.map((e) => e.role))];

    const allRooms = currentData.rooms || [];
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
    const currentData = globalState.getHotelData();
    
    // Get the database ID of the record being edited
    const recordId = type === "employee" 
        ? currentData.employees[index].id 
        : currentData.rooms[index].id;

    try {
        const endpoint = type === "employee" 
            ? `/data/employees/${recordId}` 
            : `/data/rooms/${recordId}`;
            
        const payload = type === "employee" 
            ? { name: updatedRow[0], email: updatedRow[1], role: updatedRow[2] }
            : { number: updatedRow[0], type: updatedRow[1], status: updatedRow[2] };

        // Sync change to Neon Database
        await api.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        // Re-initialize dashboard to show fresh data from server
        initDashboard('app'); 
        showToast("Changes saved to cloud successfully.");
    } catch (error) {
        console.error("Save failed:", error);
        showToast(`Failed to save: ${error.message}`);
    }
  }
};

window.handleDeleteEmployee = async function (btn, index) {
  const isPrimed = btn.classList.contains("delete-primed");

  if (!isPrimed) {
    btn.textContent = "Sure?";
    btn.classList.add("delete-primed");
    setTimeout(() => {
      if (btn) {
        btn.textContent = "Delete";
        btn.classList.remove("delete-primed");
      }
    }, 3000);
    return;
  }

  // Stage 2: Confirmed Cloud Deletion
  const currentData = globalState.getHotelData();
  const employeeId = currentData.employees[index].id;

  try {
    // 1. Call API to delete from Neon
    await api.request(`/data/employees/${employeeId}`, {
      method: "DELETE"
    });

    // 2. Visual confirmation and UI refresh
    showToast("Employee removed from cloud.");
    initDashboard('app'); 
    
  } catch (error) {
    console.error("Delete failed:", error);
    showToast(`Delete failed: ${error.message}`);
  }
};
