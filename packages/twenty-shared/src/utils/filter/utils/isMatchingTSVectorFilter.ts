import { type TSVectorFilter } from '@/types';

export const isMatchingTSVectorFilter = ({
  tsVectorFilter,
  value,
}: {
  tsVectorFilter: TSVectorFilter;
  value: string | undefined;
}) => {
  // For optimistic updates where value is undefined, skip filtering
  if (value === undefined) {
    return true;
  }

  switch (true) {
    case tsVectorFilter.search !== undefined: {
      // Guard against non-string search values that crash .toLowerCase() / .split()
      if (typeof tsVectorFilter.search !== 'string') {
        return false;
      }

      if (typeof value !== 'string') {
        return false;
      }

      const searchQuery = tsVectorFilter.search.toLowerCase();
      const searchValue = value.toLowerCase();
      const searchWords = searchQuery.split(/\s+/).filter(Boolean);
      return searchWords.every((word) => searchValue.includes(word));
    }
    default: {
      throw new Error(
        `Unexpected value for ts_vector filter : ${JSON.stringify(tsVectorFilter)}`,
      );
    }
  }
};
