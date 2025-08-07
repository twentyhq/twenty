import { RestrictedFieldsPermissions } from './RestrictedFieldsPermissions';

// TODO: DEPRECATE THIS
export type ObjectPermissionsDeprecated = {
  canRead: boolean;
  canUpdate: boolean;
  canSoftDelete: boolean;
  canDestroy: boolean;
  restrictedFields: RestrictedFieldsPermissions;
};
