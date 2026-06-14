export function radius(multiplier: number): string {
  return `calc(var(--radius-base) * ${multiplier})`;
}
