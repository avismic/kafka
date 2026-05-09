/**
 * src/dashboard/components/table-filters.js
 * State-aware filtering component for Project Kafka.
 */
export function renderTableFilters(containerId, filters, activeFilters, onFilterChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="table-filters">
            ${Object.keys(filters).map(key => {
                const activeValue = activeFilters[key] || 'all';
                return `
                <div class="filter-group">
                    <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <select class="filter-select" data-filter="${key}">
                        <option value="all" ${activeValue === 'all' ? 'selected' : ''}>All</option>
                        ${filters[key].map(val => `
                            <option value="${val}" ${activeValue === val ? 'selected' : ''}>${val}</option>
                        `).join('')}
                    </select>
                </div>`;
            }).join('')}
        </div>
    `;

    container.querySelectorAll('.filter-select').forEach(select => {
        select.onchange = (e) => onFilterChange(e.target.dataset.filter, e.target.value);
    });
}