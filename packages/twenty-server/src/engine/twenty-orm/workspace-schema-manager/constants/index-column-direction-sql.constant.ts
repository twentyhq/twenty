import { OrderByDirection } from 'twenty-shared/types';

export const INDEX_COLUMN_DIRECTION_SQL = {
  [OrderByDirection.AscNullsFirst]: 'ASC NULLS FIRST',
  [OrderByDirection.AscNullsLast]: 'ASC NULLS LAST',
  [OrderByDirection.DescNullsFirst]: 'DESC NULLS FIRST',
  [OrderByDirection.DescNullsLast]: 'DESC NULLS LAST',
} as const satisfies Record<OrderByDirection, string>;
