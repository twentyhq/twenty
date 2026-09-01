import { RELATION_NESTED_QUERY_KEYWORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const containsNestedRelationCreate = (
  records: Record<string, unknown>[],
  relationFieldNames: ReadonlySet<string>,
): boolean =>
  records.some((record) =>
    Object.entries(record).some(
      ([fieldName, value]) =>
        relationFieldNames.has(fieldName) &&
        isDefined(value) &&
        typeof value === 'object' &&
        isDefined(
          (value as Record<string, unknown>)[
            RELATION_NESTED_QUERY_KEYWORDS.CREATE
          ],
        ),
    ),
  );
