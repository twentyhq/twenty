import { type RecordPermissionsDTO } from 'src/engine/metadata-modules/record-permissions/dtos/record-permissions.dto';

export const DENIED_RECORD_PERMISSIONS: RecordPermissionsDTO = {
  canRead: false,
  canUpdate: false,
  canDelete: false,
  canSoftDelete: false,
};
