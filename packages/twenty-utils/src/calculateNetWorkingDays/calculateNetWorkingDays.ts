export function calculateNetWorkingDays(start: Date, end: Date): number {
  let count = 0, cur = new Date(start);
  while (cur <= end) {
    const d = cur.getDay(); if (d !== 0 && d !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}