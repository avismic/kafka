/**
 * src/dashboard/components/room-list.js
 * Specialized component for rendering the room status table.
 */

export function renderRoomList(containerId, roomData) {
  const container = document.getElementById(containerId);
  if (!container || !roomData) return;

  if (roomData.length === 0) {
    container.innerHTML = `<p class="no-data">No room records found.</p>`;
    return;
  }

  container.innerHTML = `
        <div class="room-table-wrapper">
            <table class="room-table">
                <thead>
                    <tr>
                        <th>Room No.</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Last Cleaned</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                  <tbody>
                      ${roomData.map((room, index) => {
                          // Defensive check: Ensure status exists before calling toLowerCase()
                          const statusClass = room.status ? room.status.toLowerCase() : 'unknown';
                          const statusText = room.status || 'N/A';
                          
                          return `
                          <tr>
                              <td>${room.number || 'N/A'}</td>
                              <td>${room.type || 'N/A'}</td>
                              <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                              <td>${room.lastCleaned || 'N/A'}</td>
                              <td class="actions-cell">
                                  <button class="edit-btn" onclick="handleEdit(this, ${index}, 'room')">Edit</button>
                              </td>
                          </tr>
                          `;
                      }).join("")}
                  </tbody>
            </table>
        </div>
    `;
}
