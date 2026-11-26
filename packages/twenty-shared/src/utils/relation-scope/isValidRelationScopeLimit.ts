import { QUERY_MAX_RECORDS_FROM_RELATION } from '@/constants';
import { isDefined } from '@/utils/validation/isDefined';

export const isValidRelationScopeLimit = (limit: number | null | undefined) =>
  !isDefined(limit) ||
  (Number.isInteger(limit) &&
    limit >= 1 &&
    limit <= QUERY_MAX_RECORDS_FROM_RELATION);
