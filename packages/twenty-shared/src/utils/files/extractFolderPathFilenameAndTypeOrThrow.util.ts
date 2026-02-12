import { isNonEmptyString } from '@sniptt/guards';

export const extractFolderPathFilenameAndTypeOrThrow = (
  fullPath: string,
): {
  folderPath: string;
  filename: string;
  type: string;
} => {
  if (!isNonEmptyString(fullPath)) {
    throw new Error('Invalid fullPath provided');
  }
  const parts = fullPath.split('/');
  const filename = parts.pop() || '';
  const folderPath = parts.join('/');

  const lastDotIndex = filename.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex + 1) : '';

  return { folderPath, filename, type: extension };
};
