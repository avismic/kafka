// src/dashboard/components/task-list.js

// 1. Update signature to accept currentUserName
export function renderTaskList(containerId, tasks, userRole, currentUserName) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!tasks || tasks.length === 0) {
    container.innerHTML = `<p class="no-data">No tasks found in this view.</p>`;
    return;
  }

  const isManager = userRole === "manager";

  container.innerHTML = `
        <table class="employee-table">
            <thead>
                <tr>
                    <th>Type</th>
                    ${isManager ? `<th>Assigned To</th>` : ""}
                    <th>Assigned By</th>
                    <th>Destination</th>
                    ${isManager ? `<th>Time Assigned</th>` : ""}
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tasks
                  .map((task) => {
                    const timeAssigned = new Date(
                      parseInt(task.id),
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const hasStarted = !!task.started_at;
                    const isCompleted = task.status === "completed";

                    // Determine display status for Managers
                    let statusLabel = task.status; // Default (pending/completed)
                    let statusClass =
                      task.status === "pending" ? "occupied" : "available";

                    if (isManager && task.status === "pending" && hasStarted) {
                      statusLabel = "Started";
                      statusClass = "maintenance"; // Use a distinct color for 'Started'
                    }

                    return `
                    <tr>
                        <td style="font-weight: 600;">${task.type}</td>
                        ${isManager ? `<td>${task.assignee}</td>` : ""}
                        <td style="color: var(--color-subtext);">${task.creator || "Manager"}</td>
                        <td>${task.destination}</td>
                        ${isManager ? `<td style="font-family: monospace; font-size: 12px;">${timeAssigned}</td>` : ""}
                        <td>
                            <span class="status-badge ${statusClass}">
                                ${statusLabel}
                            </span>
                        </td>
                        <td class="actions-cell">
                            ${
                              isManager
                                ? task.creator === currentUserName
                                  ? `<button class="delete-btn" onclick="handleDeleteTask(${task.id})">Delete</button>`
                                  : `<span style="font-size: 11px; color: var(--color-subtext);">Monitoring</span>`
                                : isCompleted
                                  ? `<span style="font-size: 11px; color: var(--color-subtext); font-style: italic;">Archived</span>`
                                  : `<div style="display: flex; gap: 8px;">
                                        <button class="edit-btn ${!hasStarted ? "save-active" : ""}" 
                                                onclick="handleStartTask(${task.id})" 
                                                ${hasStarted ? 'disabled style="opacity:0.5"' : ""}>Start</button>
                                        <button class="edit-btn ${hasStarted ? "save-active" : ""}" 
                                                onclick="handleCompleteTask(${task.id})" 
                                                ${!hasStarted ? 'disabled style="opacity:0.5"' : ""}>Done</button>
                                    </div>`
                            }
                        </td>
                    </tr>`;
                  })
                  .join("")}
            </tbody>
        </table>
    `;
}
