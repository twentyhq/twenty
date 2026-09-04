export function parseCsvLine(line: string): string[] {
  const res: string[] = []; let cur = "", inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; } else inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) { res.push(cur.trim()); cur = ""; } else cur += c;
  }
  res.push(cur.trim()); return res;
}