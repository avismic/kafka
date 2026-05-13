/**
 * src/employees/employees.js
 * Project Kafka - Employee Management Logic (Updated with Inline Editing)
 */
import { renderNav } from "../core/components/nav.js";
import { state as globalState } from "../core/state.js";
import { api } from "../core/api.js";
import { showToast } from "../core/utils.js";

export async function initEmployees(containerId) {
  const app = document.getElementById(containerId);
  const data = globalState.getHotelData();
  const employees = data.employees || [];

  renderNav("global-nav-container");

  app.innerHTML = `
        <div class="dashboard-container">
            <header class="dashboard-header">
                <div>
                    <h1 class="apple-title">Employee Directory</h1>
                    <p class="apple-subtitle">Click on codes or passwords to edit credentials.</p>
                </div>
                <button class="update-btn save-active" id="exportBtn">
                    Export Credentials (CSV)
                </button>
            </header>

            <div class="employee-list-container" style="margin-top: 40px;">
                <table class="employee-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Employee Code</th>
                            <th>Temp Password</th>
                            <th>Account Status</th>
                        </tr>
                    </thead>
                    <tbody id="employeeTableBody">
                        ${employees
                          .map(
                            (emp, index) => `
                            <tr>
                                <td style="font-weight: 600; color: var(--color-text);">${emp.name}</td>
                                <td style="color: var(--color-subtext);">${emp.role}</td>
                                <td onclick="editCredential(${emp.id}, 'employee_code', '${emp.employee_code || ""}')">
                                    <code class="code-badge editable-cell">${emp.employee_code || "SET CODE"}</code>
                                </td>
                                <td onclick="editCredential(${emp.id}, 'password_hash', '${emp.password_hash || ""}')">
                                    <span class="password-blur editable-cell">${emp.password_hash ? "••••••••" : "SET PASS"}</span>
                                </td>
                                <td>
                                    <span class="status-badge ${emp.employee_code ? "available" : "occupied"}">
                                        ${emp.employee_code ? "Active" : "Setup Required"}
                                    </span>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        </div>
    `;

  document.getElementById("exportBtn").onclick = () =>
    exportEmployeeCredentials(employees);

  // Attach the editing logic to the window for inline access
  window.editCredential = async (empId, field, currentVal) => {
    const newVal = prompt(`Enter new ${field.replace("_", " ")}:`, currentVal);

    if (newVal === null || newVal === currentVal) return;

    try {
      const payload = {};
      // If field is employee_code, we send the new code.
      // We'll need the existing password for the query if we're not changing it.
      const emp = employees.find((e) => e.id === empId);
      payload.employee_code =
        field === "employee_code" ? newVal : emp.employee_code;
      payload.password_hash =
        field === "password_hash" ? newVal : emp.password_hash;

      await api.request(`/data/employees/${empId}/credentials`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      showToast("Credentials updated.");

      // Re-fetch data to refresh local state and UI
      const updatedData = await api.request("/auth/me");
      globalState.saveHotelData(updatedData);
      initEmployees(containerId);
    } catch (error) {
      showToast(`Update failed: ${error.message}`);
    }
  };
}

/**
 * Generates a CSV file containing credentials for the manager to distribute.
 */
function exportEmployeeCredentials(employees) {
  if (!employees || employees.length === 0) return;

  const headers = ["Name", "Role", "Employee Code", "Temporary Password"];
  const rows = employees.map((e) => [
    `"${e.name}"`,
    `"${e.role}"`,
    `"${e.employee_code || "NOT_SET"}"`,
    `"${e.password_hash || "CONTACT_ADMIN"}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
    "\n",
  );

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `staff_credentials_${new Date().toISOString().split("T")[0]}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
