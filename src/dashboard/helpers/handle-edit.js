/**
 * src/dashboard/helpers/handle-edit.js
 * Logic: Toggles inline editing UI and synchronizes changes to Neon.
 */
import { api } from "../../core/api.js";
import { state as globalState } from "../../core/state.js";
import { showToast } from "../../core/utils.js";

export async function handleEdit(btn, index, type, onComplete) {
  const row = btn.closest("tr");
  const cells = row.querySelectorAll("td:not(.actions-cell)");
  const isEditing = btn.textContent === "Save";

  if (!isEditing) {
    // 1. Switch to Edit Mode: Prepare Dropdowns
    const currentData = globalState.getHotelData();
    const allEmployees = currentData.employees || [];
    const roles = [...new Set(allEmployees.map((e) => e.role))];

    const allRooms = currentData.rooms || [];
    const roomTypes = [...new Set(allRooms.map((r) => r.type))];
    const roomStatuses = [...new Set(allRooms.map((r) => r.status))];

    cells.forEach((cell, cellIndex) => {
      const currentText = cell.textContent.trim();
      if (type === "employee" && cellIndex === 2) {
        cell.innerHTML = `<select class="editing-input">
          ${roles.map((opt) => `<option value="${opt}" ${opt === currentText ? "selected" : ""}>${opt}</option>`).join("")}
        </select>`;
      } else if (type === "room" && (cellIndex === 1 || cellIndex === 2)) {
        const options = cellIndex === 1 ? roomTypes : roomStatuses;
        cell.innerHTML = `<select class="editing-input">
          ${options.map((opt) => `<option value="${opt}" ${opt === currentText ? "selected" : ""}>${opt}</option>`).join("")}
        </select>`;
      } else {
        cell.innerHTML = `<input type="text" class="editing-input" value="${currentText}">`;
      }
    });
    btn.textContent = "Save";
    btn.classList.add("save-active");
  } else {
    // 2. Execute Save Logic: API Call
    const inputs = row.querySelectorAll(".editing-input");
    const updatedRow = Array.from(inputs).map((input) => input.value);
    const currentData = globalState.getHotelData();
    const recordId = type === "employee" ? currentData.employees[index].id : currentData.rooms[index].id;

    try {
      const endpoint = type === "employee" ? `/data/employees/${recordId}` : `/data/rooms/${recordId}`;
      const payload = type === "employee" 
        ? { name: updatedRow[0], email: updatedRow[1], role: updatedRow[2] }
        : { number: updatedRow[0], type: updatedRow[1], status: updatedRow[2] };

      await api.request(endpoint, { method: "PUT", body: JSON.stringify(payload) });
      showToast("Changes saved to cloud successfully.");
      if (onComplete) onComplete();
    } catch (error) {
      showToast(`Failed to save: ${error.message}`);
    }
  }
}