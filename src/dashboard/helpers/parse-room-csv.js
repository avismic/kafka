/**
 * src/dashboard/helpers/parse-room-csv.js
 * Logic: Converts raw CSV text into Room objects.
 */
export function parseRoomCSV(csvText) {
  if (!csvText) return [];
  const lines = csvText.trim().split("\n");
  return lines.slice(1).map((line) => {
    const v = line.split(",").map((item) => item.trim());
    return { number: v[0], type: v[1], status: v[2], lastCleaned: v[3] };
  });
}