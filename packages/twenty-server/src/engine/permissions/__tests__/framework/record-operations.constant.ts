import { type ObjectRecordsOperationType } from 'twenty-shared/types';

export const RECORD_OPERATIONS = [
  'select',
  'update',
  'soft-delete',
  'restore',
  'delete',
] as const satisfies ObjectRecordsOperationType[];

export type RecordOperation = (typeof RECORD_OPERATIONS)[number];

export const EVERY_OPERATION: RecordOperation[] = [...RECORD_OPERATIONS];
export const NO_OPERATION: RecordOperation[] = [];
