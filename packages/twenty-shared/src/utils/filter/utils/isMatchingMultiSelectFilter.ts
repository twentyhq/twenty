import { type MultiSelectFilter } from '@/types';
import { isDefined } from '@/utils/validation/isDefined';

export const isMatchingMultiSelectFilter = ({
  multiSelectFilter,
  value,
}: {
  multiSelectFilter: MultiSelectFilter;
  value: string[] | null;
}) => {
  if (!isDefined(multiSelectFilter)) {
    return false;
  }

  if (Array.isArray(multiSelectFilter)) {
    return (
      Array.isArray(value) &&
      multiSelectFilter.some((item) => value.includes(item))
    );
  }

  if (typeof multiSelectFilter === 'string') {
    return Array.isArray(value) && value.includes(multiSelectFilter);
  }

  switch (true) {
    case multiSelectFilter.containsAny !== undefined: {
      return (
        Array.isArray(value) &&
        Array.isArray(multiSelectFilter.containsAny) &&
        multiSelectFilter.containsAny.some((item) => value.includes(item))
      );
    }
    case (multiSelectFilter as Record<string, unknown>).in !== undefined: {
      const inList = (multiSelectFilter as Record<string, unknown>).in;
      if (Array.isArray(inList)) {
        return (
          Array.isArray(value) &&
          inList.some((item) => value.includes(item))
        );
      }
      return Array.isArray(value) && value.includes(inList as string);
    }
    case (multiSelectFilter as Record<string, unknown>).eq !== undefined: {
      const eqVal = (multiSelectFilter as Record<string, unknown>).eq as string;
      return Array.isArray(value) && value.includes(eqVal);
    }
    case (multiSelectFilter as Record<string, unknown>).neq !== undefined: {
      const neqVal = (multiSelectFilter as Record<string, unknown>).neq as string;
      return Array.isArray(value) && !value.includes(neqVal);
    }
    case multiSelectFilter.isEmptyArray !== undefined: {
      return Array.isArray(value) && value.length === 0;
    }
    case multiSelectFilter.is !== undefined: {
      if (multiSelectFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for multi-select filter: ${JSON.stringify(
          multiSelectFilter,
        )}`,
      );
    }
  }
};
