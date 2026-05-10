/**
 * src/dashboard/helpers/parse-employee-csv.js
 * Logic: Converts raw CSV text into Employee objects.
 */
export function parseEmployeeCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.trim().split("\n");
  return lines.slice(1).map((line) => {
    const v = line.split(",").map((item) => item.trim());
    return { name: v[0], email: v[1], role: v[2], dept: v[3] };
  });
}