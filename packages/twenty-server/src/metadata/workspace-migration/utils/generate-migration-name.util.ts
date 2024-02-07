export function generateMigrationName(
  name?: string,
  addMilliseconds: number = 0,
): string {
  return `${new Date().getTime() + addMilliseconds}${name ? `-${name}` : ''}`;
}
