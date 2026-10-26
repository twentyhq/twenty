export type RecordPermissionAction =
  | 'read'
  | 'update'
  | 'softDelete'
  | 'destroy'
  | 'share'
  | 'receive';

export type RecordCapability = RecordPermissionAction | 'create' | 'restore';

export type RecordCapabilities = Partial<Record<RecordCapability, boolean>>;
