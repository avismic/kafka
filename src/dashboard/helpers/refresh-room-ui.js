/**
 * src/dashboard/helpers/refresh-room-ui.js
 * Logic: Filters and renders the room table with status-specific pagination.
 */
import { renderRoomList } from "../components/room-list.js";
import { renderPagination } from "../components/pagination.js";
import { renderTableFilters } from "../components/table-filters.js";
import { parseRoomCSV } from "./parse-room-csv.js";

export function refreshRoomUI(data, dashboardState) {
  const all = Array.isArray(data) ? data : parseRoomCSV(data);
  const types = [...new Set(all.map((r) => r.type))];
  const statuses = [...new Set(all.map((r) => r.status))];

  const filtered = all.filter((r) => {
    const matchesSearch = Object.values(r).some((v) =>
      v !== null && v !== undefined
        ? v.toString().toLowerCase().includes(dashboardState.searchQuery)
        : false,
    );

    const matchesType =
      dashboardState.room.filters.type === "all" ||
      r.type === dashboardState.room.filters.type;
    const matchesStatus =
      dashboardState.room.filters.status === "all" ||
      r.status === dashboardState.room.filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  renderTableFilters(
    "roomFilterContainer",
    { type: types, status: statuses },
    dashboardState.room.filters,
    (key, val) => {
      dashboardState.room.filters[key] = val;
      dashboardState.room.page = 1;
      refreshRoomUI(data, dashboardState);
    },
  );

  const { page, size } = dashboardState.room;
  const paginated = filtered.slice((page - 1) * size, page * size);
  renderRoomList("roomListContainer", paginated);
  
  renderPagination(
    "roomPaginationContainer",
    { total: filtered.length, current: page, size },
    (p) => {
      dashboardState.room.page = p;
      refreshRoomUI(data, dashboardState);
    },
    (s) => {
      dashboardState.room.size = s;
      dashboardState.room.page = 1;
      refreshRoomUI(data, dashboardState);
    },
  );
}