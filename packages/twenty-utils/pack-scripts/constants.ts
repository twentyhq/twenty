import path from 'path';

export const PKG_PATH = path.resolve(process.cwd(), 'package.json');
export const BACKUP_PATH = path.resolve(
  process.cwd(),
  'package.__backup__.json',
);
