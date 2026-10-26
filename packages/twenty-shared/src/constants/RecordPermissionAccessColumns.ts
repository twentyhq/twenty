import { type RecordPermissionAction } from '../types/RecordPermissionAction';

export const RECORD_PERMISSION_ACCESS_COLUMNS = {
  read: 'readableByAccessGroupIds',
  update: 'writableByAccessGroupIds',
  softDelete: 'softDeletableByAccessGroupIds',
  destroy: 'destroyableByAccessGroupIds',
  share: 'shareableByAccessGroupIds',
  receive: 'receivableByAccessGroupIds',
} as const satisfies Record<RecordPermissionAction, string>;
