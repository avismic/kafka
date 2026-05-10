/**
 * src/dashboard/helpers/refresh-employee-ui.js
 * Logic: Filters and renders the employee table with pagination.
 */
import { renderEmployeeList } from "../components/employee-list.js";
import { renderPagination } from "../components/pagination.js";
import { renderTableFilters } from "../components/table-filters.js";
import { parseEmployeeCSV } from "./parse-employee-csv.js";

export function refreshEmployeeUI(data, dashboardState) {
  const all = Array.isArray(data) ? data : parseEmployeeCSV(data);
  const roles = [...new Set(all.map((e) => e.role))];

  const filtered = all.filter((e) => {
    const matchesSearch = Object.values(e).some((val) =>
      val?.toString().toLowerCase().includes(dashboardState.searchQuery),
    );
    const matchesRole =
      dashboardState.employee.filters.role === "all" ||
      e.role === dashboardState.employee.filters.role;

    return matchesSearch && matchesRole;
  });

  filtered.sort((a, b) => a.name.localeCompare(b.name));

  renderTableFilters(
    "empFilterContainer",
    { role: roles },
    { role: dashboardState.employee.filters.role },
    (key, val) => {
      dashboardState.employee.filters[key] = val;
      dashboardState.employee.page = 1;
      refreshEmployeeUI(data, dashboardState);
    },
  );

  const { page, size } = dashboardState.employee;
  const paginated = filtered.slice((page - 1) * size, page * size);
  renderEmployeeList("employeeListContainer", paginated);
  
  renderPagination(
    "empPaginationContainer",
    { total: filtered.length, current: page, size },
    (p) => {
      dashboardState.employee.page = p;
      refreshEmployeeUI(data, dashboardState);
    },
    (s) => {
      dashboardState.employee.size = s;
      dashboardState.employee.page = 1;
      refreshEmployeeUI(data, dashboardState);
    },
  );
}