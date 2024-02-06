export function generateMigrationName(name?: string): string {
  return `${new Date().getTime()}${name ? `-${name}` : ''}`;
}
