import { RestrictedFieldsPermissions } from '@/types/RestrictedFieldsPermissions';

export type ObjectPermissions = {
  canRead: boolean;
  canUpdate: boolean;
  canSoftDelete: boolean;
  canDestroy: boolean;
  restrictedFields: RestrictedFieldsPermissions;
};
