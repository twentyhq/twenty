export const generateMigrationName = (name?: string): string =>
  `${new Date().getTime()}${name ? `-${name}` : ''}`;
