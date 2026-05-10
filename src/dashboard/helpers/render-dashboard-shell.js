/**
 * src/dashboard/helpers/render-dashboard-shell.js
 * Logic: Renders the structural HTML shell for the dashboard.
 */
export function renderDashboardShell(container, hotelName, empCount, roomCount) {
  container.innerHTML = `
        <div class="dashboard-container">
            <header class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1>${hotelName} Dashboard</h1>
                    <p>Welcome to your Kafka Management Suite.</p>
                </div>
                <button class="update-btn" onclick="window.location.hash = '#assign-task'">Assign Task</button>
            </header>
            <div id="searchBarContainer"></div>
            
            <div class="dashboard-grid">
                <div class="stats-card">
                    <h3>Total Employees</h3>
                    <p class="stat-value" id="empStatCount">${empCount}</p>
                </div>
                <div class="stats-card">
                    <h3>Active Rooms</h3>
                    <p class="stat-value" id="roomStatCount">${roomCount}</p>
                </div>
            </div>

            <section id="taskSection">
                <div class="section-header">
                    <h2>Live Task Monitor</h2>
                    <span class="status-badge occupied" id="taskActiveCount">0 Active</span>
                </div>
                <div id="taskFilterContainer"></div>
                <div id="taskListContainer" class="employee-table-wrapper"></div>
                <div id="taskPaginationContainer"></div>
            </section>

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
}