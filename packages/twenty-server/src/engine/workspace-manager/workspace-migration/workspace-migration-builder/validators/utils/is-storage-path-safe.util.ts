import path from 'path';

export const isStoragePathSafe = (storagePath: string): boolean => {
  if (storagePath.includes('\0')) {
    return false;
  }

  if (path.isAbsolute(storagePath)) {
    return false;
  }

  const normalized = path.normalize(storagePath);

  if (normalized.split(path.sep).includes('..')) {
    return false;
  }

  return true;
};
