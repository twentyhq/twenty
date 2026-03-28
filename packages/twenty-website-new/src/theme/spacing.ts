export function spacing(multiplier: number): string {
  return `calc(var(--spacing-base) * ${multiplier})`
}
