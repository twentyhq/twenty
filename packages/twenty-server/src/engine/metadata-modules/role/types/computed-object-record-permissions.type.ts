import { type ObjectRecordPermissions } from 'src/engine/metadata-modules/role/types/object-record-permissions.type';

export type ComputedObjectRecordPermissions = {
  objectRecordPermissions: ObjectRecordPermissions;
  appliesFieldPermissions: boolean;
};
