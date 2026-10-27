import { type RECORD_OPERATIONS } from '@/constants/RecordOperations';

export type RecordOperation = (typeof RECORD_OPERATIONS)[number];
