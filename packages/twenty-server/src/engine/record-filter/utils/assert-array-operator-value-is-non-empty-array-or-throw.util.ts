import { msg } from '@lingui/core/macro';

import {
  RecordFilterException,
  RecordFilterExceptionCode,
} from 'src/engine/record-filter/exceptions/record-filter.exception';

const ARRAY_OPERATORS = ['in', 'contains', 'notContains'];

export const assertArrayOperatorValueIsNonEmptyArrayOrThrow = ({
  operator,
  value,
  key,
}: {
  operator: string;
  value: unknown;
  key: string;
}): void => {
  if (
    ARRAY_OPERATORS.includes(operator) &&
    (!Array.isArray(value) || value.length === 0)
  ) {
    throw new RecordFilterException({
      message: `Invalid filter value for field ${key}. Expected non-empty array`,
      code: RecordFilterExceptionCode.INVALID_QUERY_INPUT,
      userFriendlyMessage: msg`Invalid filter value`,
    });
  }
};
