import { type PermissionFlagType } from '@/constants';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

type WithObjectIdentifier = {
  objectUniversalIdentifier: string;
  objectNameSingular?: never;
};

type WithObjectName = {
  objectNameSingular: string;
  objectUniversalIdentifier?: never;
};

type BaseObjectPermission = {
  canReadObjectRecords?: boolean;
  canUpdateObjectRecords?: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

type ObjectPermission =
  | (BaseObjectPermission & WithObjectIdentifier)
  | (BaseObjectPermission & WithObjectName);

type WithFieldIdentifier = {
  fieldUniversalIdentifier: string;
  fieldName?: never;
};

type WithFieldName = {
  fieldName: string;
  fieldUniversalIdentifier?: never;
};

type BaseFieldPermission = {
  canReadFieldValue?: boolean;
  canUpdateFieldValue?: boolean;
};

type FieldPermission =
  | (BaseFieldPermission & WithObjectIdentifier & WithFieldIdentifier)
  | (BaseFieldPermission & WithObjectIdentifier & WithFieldName)
  | (BaseFieldPermission & WithObjectName & WithFieldIdentifier)
  | (BaseFieldPermission & WithObjectName & WithFieldName);

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
