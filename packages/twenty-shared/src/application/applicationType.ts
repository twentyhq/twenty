import { type ApplicationVariables } from '@/application';
import { type PermissionFlagType } from '@/constants';

type ObjectPermission = {
  objectMetadataId: string;
  canReadObjectRecords?: boolean;
  canUpdateObjectRecords?: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

type FieldPermission = {
  objectMetadataId: string;
  fieldMetadataId: string;
  canReadFieldValue?: boolean;
  canUpdateFieldValue?: boolean;
};

type Role = {
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
  canBeAssignedToApplications?: boolean;
  universalIdentifier: string;
  objectPermissions?: ObjectPermission[];
  fieldPermissions?: FieldPermission[];
  permissionFlags?: PermissionFlagType[];
};

export type Application = {
  universalIdentifier: string;
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: ApplicationVariables;
  applicationRole?: Role;
};
