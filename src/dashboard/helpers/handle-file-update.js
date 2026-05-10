/**
 * src/dashboard/helpers/handle-file-update.js
 * Logic: Reads CSV files, syncs bulk data with Neon, and triggers UI refreshes.
 */
import { api } from "../../core/api.js";
import { showToast } from "../../core/utils.js";
import { parseEmployeeCSV } from "./parse-employee-csv.js";
import { parseRoomCSV } from "./parse-room-csv.js";
import { refreshEmployeeUI } from "./refresh-employee-ui.js";
import { refreshRoomUI } from "./refresh-room-ui.js";

export async function handleFileUpdate(file, type, dashboardState) {
  if (!file) return;
  const reader = new FileReader();

  reader.onload = async (event) => {
    const content = event.target.result;

    try {
      if (type === "employee") {
        const employees = parseEmployeeCSV(content);
        await api.request("/data/employees/bulk", {
          method: "POST",
          body: JSON.stringify({ employees }),
        });

        refreshEmployeeUI(employees, dashboardState);
        document.getElementById("empStatCount").textContent = employees.length;
        showToast("Employee records synced to cloud.");
      } else if (type === "room") {
        const rooms = parseRoomCSV(content);
        await api.request("/data/rooms/bulk", {
          method: "POST",
          body: JSON.stringify({ rooms }),
        });

        refreshRoomUI(rooms, dashboardState);
        document.getElementById("roomStatCount").textContent = rooms.length;
        showToast("Room records synced to cloud.");
      }
    } catch (error) {
      console.error(`Sync failed for ${type}:`, error);
      showToast(`Sync failed: ${error.message}`);
    }
  };
  reader.readAsText(file);
}