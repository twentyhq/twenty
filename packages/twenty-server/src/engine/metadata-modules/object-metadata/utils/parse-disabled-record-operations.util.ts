import { type RecordOperation } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

const RECORD_OPERATION_SCHEMA = z.enum([
  'read',
  'create',
  'update',
  'softDelete',
  'restore',
  'destroy',
]);

export const parseDisabledRecordOperations = (
  value: unknown,
): RecordOperation[] | null => {
  if (!isDefined(value)) return null;

  return [...new Set(z.array(RECORD_OPERATION_SCHEMA).parse(value))];
};
