function padCounter(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatCounter(position: number, totalCount: number): string {
  return `${padCounter(position)} / ${padCounter(totalCount)}`;
}
