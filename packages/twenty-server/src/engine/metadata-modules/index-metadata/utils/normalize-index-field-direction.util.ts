import { OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const normalizeIndexFieldDirection = (
  direction: OrderByDirection | null | undefined,
): OrderByDirection | null =>
  isDefined(direction) && direction !== OrderByDirection.AscNullsLast
    ? direction
    : null;
