export function generateRandomColorPalette(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.round((i * 360) / count);
    colors.push(`hsl(${hue}, 70%, 55%)`);
  }
  return colors;
}