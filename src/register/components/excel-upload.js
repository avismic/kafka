/**
 * src/register/components/excel-upload.js
 * Local component for handling employee data uploads via Excel/CSV.
 */

export function renderExcelUpload(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
        <div class="excel-upload-zone" id="dropZone">
            <p id="fileName">Drop employee Excel/CSV here or <span>browse</span></p>
            <input type="file" id="fileInput" accept=".csv, .xlsx, .xls" hidden>
        </div>
    `;

  const dropZone = container.querySelector("#dropZone");
  const fileInput = container.querySelector("#fileInput");
  const fileNameDisplay = container.querySelector("#fileName");

  // Click to browse
  dropZone.addEventListener("click", () => fileInput.click());

  // File selection handling
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleFileRead(file, fileNameDisplay);
  });

  // Simple Drag & Drop visual feedback
  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "var(--color-text)";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "var(--color-border)";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file, fileNameDisplay);
    dropZone.style.borderColor = "var(--color-border)";
  });

  function handleFileRead(file, displayElement) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      // Store raw CSV in a temporary state or broadcast it
      window.tempCSVData = content;
      displayElement.textContent = `Ready: ${file.name}`;
    };
    reader.readAsText(file);
  }
}
