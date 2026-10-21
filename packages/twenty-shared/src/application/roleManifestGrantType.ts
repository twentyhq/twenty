import { type ObjectPermissionAction } from '@/application/objectPermissionActionType';

export type RoleManifestGrant =
  | {
      type: 'ALL_OBJECT_RECORDS';
      action: ObjectPermissionAction;
    }
  | {
      type: 'ALL_SETTINGS';
    }
  | {
      type: 'ALL_TOOLS';
    }
  | {
      type: 'PERMISSION_FLAG';
      permissionFlagUniversalIdentifier: string;
    }
  | {
      type: 'OBJECT_RECORDS';
      objectUniversalIdentifier: string;
      action: ObjectPermissionAction;
    }
  | {
      type: 'FIELD_VALUE';
      objectUniversalIdentifier: string;
      fieldUniversalIdentifier: string;
      action: 'canReadFieldValue' | 'canUpdateFieldValue';
    }
  | {
      type: 'ROW_LEVEL_RESTRICTION';
      objectUniversalIdentifier: string;
    };
