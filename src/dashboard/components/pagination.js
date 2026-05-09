/**
 * src/dashboard/components/pagination.js
 * Decoupled pagination component with Apple-style minimalist UI.
 */
export function renderPagination(containerId, { total, current, size }, onPageChange, onSizeChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const start = total === 0 ? 0 : (current - 1) * size + 1;
    const end = Math.min(current * size, total);
    const totalPages = Math.ceil(total / size) || 1;

    container.innerHTML = `
        <div class="pagination-bar">
            <div class="pagination-info">Showing ${start}-${end} of ${total}</div>
            
            <div class="pagination-nav">
                <button class="nav-btn" ${current === 1 ? 'disabled' : ''} id="prev-${containerId}">Previous</button>
                <span class="page-indicator">Page ${current} of ${totalPages}</span>
                <button class="nav-btn" ${current === totalPages ? 'disabled' : ''} id="next-${containerId}">Next</button>
            </div>

            <div class="pagination-sizes">
                ${[5, 10, 20, 50, 100].map(s => `
                    <button class="size-btn ${s === size ? 'active' : ''}" data-size="${s}">${s}</button>
                `).join('')}
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById(`prev-${containerId}`).onclick = () => onPageChange(current - 1);
    document.getElementById(`next-${containerId}`).onclick = () => onPageChange(current + 1);
    
    container.querySelectorAll('.size-btn').forEach(btn => {
        btn.onclick = () => onSizeChange(parseInt(btn.dataset.size));
    });
}