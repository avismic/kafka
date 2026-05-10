import { renderNav } from "../core/components/nav.js";
import { state as globalState } from "../core/state.js";
import { showToast } from "../core/utils.js";
import { renderTaskForm } from "./helpers/render-task-form.js";
import { api } from "../core/api.js";

export async function initTasks(containerId) {
  const app = document.getElementById(containerId);
  const data = globalState.getHotelData();
  const employees = data.employees || [];
  renderNav("global-nav-container");
  renderTaskForm(app, data.employees || [], data.rooms || []);

  // Helper functions exposed to window for inline events
  window.toggleCustomDuration = (val) => {
    document.getElementById("customDurationInput").style.display =
      val === "custom" ? "block" : "none";
  };

  window.addChecklistItem = () => {
    const div = document.createElement("div");
    div.style = "display: flex; gap: 8px; margin-bottom: 8px;";
    div.innerHTML = `<input type="text" class="editing-input checklist-item" placeholder="Next requirement...">`;
    document.getElementById("checklistContainer").appendChild(div);
  };

  document.getElementById("taskForm").onsubmit = async (e) => {
    e.preventDefault();
    const assigneeName = document.getElementById("taskAssigneeInput").value;
    const selectedEmp = employees.find((emp) => emp.name === assigneeName);
    const durationVal = document.getElementById("taskDuration").value;
    const duration =
      durationVal === "custom"
        ? `${document.getElementById("customDurationInput").value} mins`
        : `${durationVal} mins`;
    const taskData = {
      id: Date.now(),
      type: document.getElementById("taskType").value,
      assignee: assigneeName,
      assigneeId: selectedEmp ? selectedEmp.id : null,
      destination: document.getElementById("taskDestInput").value,
      duration: duration,
      checklist: Array.from(document.querySelectorAll(".checklist-item"))
        .map((i) => i.value)
        .filter((v) => v.trim() !== ""),
      notes: document.getElementById("taskNotes").value,
    };

    try {
      await api.request("/data/tasks", {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      showToast("Task assigned and synced to cloud.");
      e.target.reset();
      setTimeout(() => {
        window.location.hash = "#dashboard";
      }, 1000);
    } catch (error) {
      console.error("Sync Error:", error);
      showToast(`Sync failed: ${error.message}`);
    }
  };
}
