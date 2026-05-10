/**
 * src/dashboard/helpers/render-dashboard-shell.js
 * Logic: Renders the structural HTML shell for the dashboard.
 */
export function renderDashboardShell(container, hotelName, empCount, roomCount) {
  container.innerHTML = `
        <div class="dashboard-container">
            <header class="dashboard-header">
                <h1>${hotelName} Dashboard</h1>
                <p>Welcome to your Kafka Management Suite.</p>
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