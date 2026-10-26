import { type RecordPermissionAction } from '@/types/RecordPermissionAction';

export const RECORD_PERMISSION_ACTIONS = [
  'read',
  'update',
  'softDelete',
  'destroy',
  'share',
  'receive',
] as const satisfies readonly RecordPermissionAction[];
