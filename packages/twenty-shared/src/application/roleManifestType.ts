import { type PermissionFlagType } from '@/constants';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type ObjectPermissionManifest = {
  objectUniversalIdentifier: string;
  canReadObjectRecords?: boolean;
  canUpdateObjectRecords?: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

export type FieldPermissionManifest = {
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
  objectPermissions?: ObjectPermissionManifest[];
  fieldPermissions?: FieldPermissionManifest[];
  permissionFlags?: PermissionFlagType[];
};
