import { type PermissionFlagType } from '@/constants';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

type ObjectPermission = {
  objectUniversalIdentifier: string;
  canReadObjectRecords?: boolean;
  canUpdateObjectRecords?: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

type FieldPermission = {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  canReadFieldValue?: boolean;
  canUpdateFieldValue?: boolean;
};

export type RoleManifest = SyncableEntityOptions & {
  label: string;
  description?: string;
  icon?: string;
  canUpdateAllSettings?: boolean;
  canAccessAllTools?: boolean;
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
  canSoftDeleteAllObjectRecords?: boolean;
  canDestroyAllObjectRecords?: boolean;
  canBeAssignedToUsers?: boolean;
  canBeAssignedToAgents?: boolean;
  canBeAssignedToApiKeys?: boolean;
  objectPermissions?: ObjectPermission[];
  fieldPermissions?: FieldPermission[];
  permissionFlags?: PermissionFlagType[];
};
