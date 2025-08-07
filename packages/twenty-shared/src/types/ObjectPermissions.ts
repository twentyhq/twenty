import { RestrictedFieldsPermissions } from '@/types/RestrictedFieldsPermissions';

export type ObjectPermissions = {
  canReadObjectRecords: boolean;
  canUpdateObjectRecords: boolean;
  canSoftDeleteObjectRecords: boolean;
  canDestroyObjectRecords: boolean;
  restrictedFields: RestrictedFieldsPermissions;
};
