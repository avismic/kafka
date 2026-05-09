/**
 * src/dashboard/components/employee-list.js
 * Specialized component for rendering the employee table.
 */

export function renderEmployeeList(containerId, employeeData) {
  const container = document.getElementById(containerId);
  if (!container || !employeeData) return;

  if (employeeData.length === 0) {
    container.innerHTML = `<p class="no-data">No employee records found.</p>`;
    return;
  }

  // Creating a minimalist, refined table structure
  container.innerHTML = `
        <div class="employee-table-wrapper">
            <table class="employee-table">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${employeeData
                      .map(
                        (emp, index) => `
                        <tr>
                            <td>${emp.name}</td>
                            <td>${emp.email}</td>
                            <td>${emp.role}</td>
                            <td class="actions-cell">
                              <button class="edit-btn" onclick="handleEdit(this, ${index}, 'employee')">Edit</button>
                              <button class="delete-btn" onclick="handleDeleteEmployee(this, ${index})">Delete</button>
                            </td>
                        </tr>
                    `,
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
    `;
}
