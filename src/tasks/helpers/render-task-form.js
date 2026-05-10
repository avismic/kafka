//src/tasks/helpers/render-task-form.js

export function renderTaskForm(container, employees, rooms) {
  const taskTypes = [
    "Cleaning",
    "Delivery",
    "Laundry",
    "Inspection",
    "Maintenance",
    "Guest Request",
  ];
  const destinations = [
    "Lobby",
    "Kitchen",
    "Gym",
    "Pool",
    ...rooms.map((r) => `Room ${r.number}`),
  ];

  container.innerHTML = `
        <div class="dashboard-container">
            <header class="dashboard-header">
                <h1>Assign Task</h1>
                <p>Precision directive for hotel operations.</p>
            </header>
            
            <div class="stats-card" style="opacity: 1; transform: none; max-width: 650px; margin: 0 auto;">
                <form id="taskForm">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label class="task-label">Task Type</label>
                            <select id="taskType" class="editing-input" required>
                                ${taskTypes.map((t) => `<option value="${t}">${t}</option>`).join("")}
                            </select>
                        </div>
                        <div>
                            <label class="task-label">Assign Employee</label>
                            <input type="list" id="taskAssigneeInput" list="employeeList" class="editing-input" placeholder="Search..." required>
                            <datalist id="employeeList">
                                ${employees.map((emp) => `<option value="${emp.name}">`).join("")}
                            </datalist>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div>
                            <label class="task-label">Destination</label>
                            <input type="list" id="taskDestInput" list="destList" class="editing-input" placeholder="Where?" required>
                            <datalist id="destList">
                                ${destinations.map((d) => `<option value="${d}">`).join("")}
                            </datalist>
                        </div>
                        <div>
                            <label class="task-label">Finish In</label>
                            <select id="taskDuration" class="editing-input" onchange="toggleCustomDuration(this.value)">
                                <option value="15">15 Mins</option>
                                <option value="30">30 Mins</option>
                                <option value="45">45 Mins</option>
                                <option value="custom">Custom...</option>
                            </select>
                            <input type="number" id="customDurationInput" class="editing-input" style="display:none; margin-top:8px;" placeholder="Minutes">
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label class="task-label">Checklist Items</label>
                        <div id="checklistContainer">
                            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                                <input type="text" class="editing-input checklist-item" placeholder="Task requirement...">
                                <button type="button" class="update-btn" onclick="addChecklistItem()">+</button>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 24px;">
                        <label class="task-label">Notes</label>
                        <textarea id="taskNotes" class="editing-input" style="height: 60px; padding: 12px; resize: none;" placeholder="Specific instructions..."></textarea>
                    </div>

                    <div style="display: flex; gap: 12px;">
                        <button type="submit" class="update-btn save-active" style="flex: 1;">Deploy Task</button>
                        <button type="button" class="update-btn" style="flex: 1;" onclick="window.location.hash = '#dashboard'">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}
