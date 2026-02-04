import { type FilesFilter } from '@/types';

export const isMatchingFilesFilter = ({
  filesFilter,
  value,
}: {
  filesFilter: FilesFilter;
  value: Record<string, any> | null;
}) => {
  switch (true) {
    case filesFilter.like !== undefined: {
      const escapedPattern = filesFilter.like.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      const regexPattern = escapedPattern.replace(/%/g, '.*');
      const regexCaseInsensitive = new RegExp(`^${regexPattern}$`, 'is');

      const stringValue = JSON.stringify(value, null, 1);

      return regexCaseInsensitive.test(stringValue);
    }
    case filesFilter.is !== undefined: {
      if (filesFilter.is === 'NULL') {
        return value === null || value.length === 0;
      } else {
        return value !== null && value.length > 0;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for files filter : ${JSON.stringify(filesFilter)}`,
      );
    }
  }
};
