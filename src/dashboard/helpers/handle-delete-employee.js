/**
 * src/dashboard/helpers/handle-delete-employee.js
 * Logic: Permanent cloud deletion for employee records.
 */
import { api } from "../../core/api.js";
import { state as globalState } from "../../core/state.js";
import { showToast } from "../../core/utils.js";

export async function handleDeleteEmployee(btn, index, onComplete) {
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

  const currentData = globalState.getHotelData();
  const employeeId = currentData.employees[index].id;

  try {
    await api.request(`/data/employees/${employeeId}`, {
      method: "DELETE"
    });

    showToast("Employee removed from cloud.");
    if (onComplete) onComplete(); 
  } catch (error) {
    console.error("Delete failed:", error);
    showToast(`Delete failed: ${error.message}`);
  }
}