/**
 * src/dashboard/components/search-bar.js
 * Universal search component for filtering dashboard tables.
 */

export function renderSearchBar(containerId, onSearch) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
        <div class="search-container">
            <input type="text" id="universalSearch" placeholder="Search employees or rooms..." autocomplete="off">
        </div>
    `;

  const searchInput = document.getElementById("universalSearch");

  // Real-time filtering on input
  searchInput.addEventListener("input", (e) => {
    onSearch(e.target.value.toLowerCase());
  });
}
