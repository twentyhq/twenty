import { type UUIDFilter, type UUIDFilterValue } from '@/types';

export const isMatchingUUIDFilter = ({
  uuidFilter,
  value,
}: {
  uuidFilter: UUIDFilter;
  value: UUIDFilterValue;
}) => {
  switch (true) {
    case uuidFilter.eq !== undefined: {
      return value === uuidFilter.eq;
    }
    case uuidFilter.neq !== undefined: {
      return value !== uuidFilter.neq;
    }
    case uuidFilter.gt !== undefined: {
      return value > uuidFilter.gt;
    }
    case uuidFilter.gte !== undefined: {
      return value >= uuidFilter.gte;
    }
    case uuidFilter.lt !== undefined: {
      return value < uuidFilter.lt;
    }
    case uuidFilter.lte !== undefined: {
      return value <= uuidFilter.lte;
    }
    case uuidFilter.in !== undefined: {
      return uuidFilter.in.includes(value);
    }
    case uuidFilter.is !== undefined: {
      if (uuidFilter.is === 'NULL') {
        return value === null;
      } else {
        return value !== null;
      }
    }
    default: {
      throw new Error(
        `Unexpected value for UUID filter: ${JSON.stringify(uuidFilter)}`,
      );
    }
  }
};
