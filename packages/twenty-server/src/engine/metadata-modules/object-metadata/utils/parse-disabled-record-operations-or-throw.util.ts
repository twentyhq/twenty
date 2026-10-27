import { RECORD_OPERATIONS } from 'twenty-shared/constants';
import { type RecordOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

export const parseDisabledRecordOperationsOrThrow = (
  value: unknown,
): RecordOperation[] | null => {
  if (!isDefined(value)) return null;

  return [...new Set(z.array(z.enum(RECORD_OPERATIONS)).parse(value))];
};
