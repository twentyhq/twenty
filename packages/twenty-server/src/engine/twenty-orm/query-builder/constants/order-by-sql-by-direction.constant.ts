import { type OrderBy } from 'twenty-shared/types';

export const ORDER_BY_SQL_BY_DIRECTION: Record<
  OrderBy,
  { direction: 'ASC' | 'DESC'; nulls: 'NULLS FIRST' | 'NULLS LAST' }
> = {
  AscNullsFirst: { direction: 'ASC', nulls: 'NULLS FIRST' },
  AscNullsLast: { direction: 'ASC', nulls: 'NULLS LAST' },
  DescNullsFirst: { direction: 'DESC', nulls: 'NULLS FIRST' },
  DescNullsLast: { direction: 'DESC', nulls: 'NULLS LAST' },
};
