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
    case typeof tsVectorFilter.search === 'string': {
      const searchQuery = tsVectorFilter.search.toLowerCase();
      const searchValue = value.toLowerCase();
      const searchWords = searchQuery.split(/\s+/).filter(Boolean);
      return searchWords.every((word) => searchValue.includes(word));
    }
    case tsVectorFilter.search !== undefined: {
      return false;
    }
    default: {
      throw new Error(
        `Unexpected value for ts_vector filter : ${JSON.stringify(tsVectorFilter)}`,
      );
    }
  }
};
