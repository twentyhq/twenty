import { type FilesFilter } from '@/types';
import { isMatchingRawJsonFilter } from '@/utils/filter/utils/isMatchingRawJsonFilter';

export const isMatchingFilesFilter = ({
  filesFilter,
  value,
}: {
  filesFilter: FilesFilter;
  value: Record<string, any> | null;
}) => {
  switch (true) {
    case filesFilter.like !== undefined: {
      return isMatchingRawJsonFilter({
        rawJsonFilter: { like: filesFilter.like },
        value,
      });
    }
    case filesFilter.ilike !== undefined: {
      return isMatchingRawJsonFilter({
        rawJsonFilter: { ilike: filesFilter.ilike },
        value,
      });
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
