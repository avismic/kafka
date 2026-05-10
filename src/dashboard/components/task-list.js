// src/dashboard/components/task-list.js

export function renderTaskList(containerId, tasks) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!tasks || tasks.length === 0) {
    container.innerHTML = `<p class="no-data">No tasks found in this view.</p>`;
    return;
  }

  container.innerHTML = `
        <table class="employee-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Assigned To</th>
                    <th>Destination</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tasks
                  .map(
                    (task) => `
                    <tr>
                        <td style="font-weight: 600;">${task.type}</td>
                        <td>${task.assignee}</td>
                        <td>${task.destination}</td>
                        <td>
                            <span class="status-badge ${task.status === "pending" ? "occupied" : "available"}">
                                ${task.status}
                            </span>
                        </td>
                        <td class="actions-cell">
                            ${
                              task.status === "pending"
                                ? `<button class="edit-btn save-active" onclick="handleCompleteTask(${task.id})">Done</button>`
                                : `<span style="font-size: 11px; color: var(--color-subtext); font-style: italic;">Archived</span>`
                            }
                        </td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}
