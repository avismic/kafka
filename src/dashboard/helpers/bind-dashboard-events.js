/**
 * src/dashboard/helpers/bind-dashboard-events.js
 * Logic: Attaches listeners for search bar and file upload inputs.
 */
import { handleFileUpdate } from "./handle-file-update.js";
import { renderSearchBar } from "../components/search-bar.js";
import { refreshEmployeeUI } from "./refresh-employee-ui.js";
import { refreshRoomUI } from "./refresh-room-ui.js";

export function bindDashboardEvents(data, dashboardState) {
  document.getElementById("updateEmpInput").onchange = (e) =>
    handleFileUpdate(e.target.files[0], "employee", dashboardState);
    
  document.getElementById("updateRoomInput").onchange = (e) =>
    handleFileUpdate(e.target.files[0], "room", dashboardState);

  renderSearchBar("searchBarContainer", (query) => {
    dashboardState.searchQuery = query.toLowerCase();
    dashboardState.employee.page = 1;
    dashboardState.room.page = 1;
    refreshEmployeeUI(data.employees, dashboardState);
    refreshRoomUI(data.rooms, dashboardState);
  });
}