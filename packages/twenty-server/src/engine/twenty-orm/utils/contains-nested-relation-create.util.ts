import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const containsNestedRelationCreate = (
  records: Record<string, unknown>[],
): boolean =>
  records.some((record) =>
    Object.values(record).some(
      (value) =>
        isDefined(value) &&
        typeof value === 'object' &&
        isDefined(
          (value as Record<string, unknown>)[
            RELATION_NESTED_QUERY_KEYWORDS.CREATE
          ],
        ),
    ),
  );
