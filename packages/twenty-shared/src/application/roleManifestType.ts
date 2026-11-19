import {
  type FieldPermissionGrant,
  type ObjectPermissionGrant,
  type RolePermissionGrants,
} from '@/application/rolePermissionGrantsSchema';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from '@/types';

export type LegacyObjectPermissionManifest = Partial<SyncableEntityOptions> &
  ObjectPermissionGrant;

export type LegacyFieldPermissionManifest = Partial<SyncableEntityOptions> &
  FieldPermissionGrant;

export type LegacyRowLevelPermissionPredicateGroupManifest =
  SyncableEntityOptions & {
    objectUniversalIdentifier: string;
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
    parentPredicateGroupUniversalIdentifier?: string | null;
    position?: number | null;
  };

export type LegacyRowLevelPermissionPredicateManifest =
  SyncableEntityOptions & {
    objectUniversalIdentifier: string;
    fieldUniversalIdentifier: string;
    operand: RowLevelPermissionPredicateOperand;
    value?: RowLevelPermissionPredicateValue | null;
    subFieldName?: string | null;
    workspaceMemberFieldUniversalIdentifier?: string | null;
    workspaceMemberSubFieldName?: string | null;
    predicateGroupUniversalIdentifier?: string | null;
    position?: number | null;
  };

export type RowLevelPermissionRulePredicateManifest = Omit<
  LegacyRowLevelPermissionPredicateManifest,
  'objectUniversalIdentifier' | 'predicateGroupUniversalIdentifier'
>;

export type RowLevelPermissionRulePredicateGroupManifest =
  SyncableEntityOptions & {
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
    position?: number | null;
    predicates?: RowLevelPermissionRulePredicateManifest[];
    predicateGroups?: RowLevelPermissionRulePredicateGroupManifest[];
  };

// fieldPermissionIdentifiers names a stored field permission whose identifier is not the derived one
export type FieldRestrictionsManifest = {
  unreadableFields?: string[];
  uneditableFields?: string[];
  fieldPermissionIdentifiers?: {
    fieldUniversalIdentifier: string;
    universalIdentifier: string;
  }[];
};

export type RowLevelRecordsPermissionsManifest = SyncableEntityOptions & {
  canReadRecords?: boolean;
  canCreateRecords?: boolean;
  canUpdateRecords?: boolean;
  canSoftDeleteRecords?: boolean;
  canDestroyRecords?: boolean;
  predicates?: RowLevelPermissionRulePredicateManifest[];
  predicateGroups?: RowLevelPermissionRulePredicateGroupManifest[];
} & FieldRestrictionsManifest;

export type AllRecordsPermissionsManifest = {
  canReadAllRecords?: boolean;
  canCreateAllRecords?: boolean;
  canUpdateAllRecords?: boolean;
  canSoftDeleteAllRecords?: boolean;
  canDestroyAllRecords?: boolean;
};

export type ObjectRecordsPermissionsManifest = Partial<SyncableEntityOptions> &
  AllRecordsPermissionsManifest & {
    objectUniversalIdentifier: string;
    rowLevelRecordsPermissions?: RowLevelRecordsPermissionsManifest[];
  } & FieldRestrictionsManifest;

export type RoleRecordsPermissionsManifest = AllRecordsPermissionsManifest & {
  objects?: ObjectRecordsPermissionsManifest[];
};

export type RowLevelPermissionRuleManifest =
  RowLevelRecordsPermissionsManifest & {
    objectUniversalIdentifier: string;
  };

export type LegacyRoleRecordsPermissionsManifest = {
  /** @deprecated Use recordsPermissions.canReadAllRecords */
  canReadAllObjectRecords?: boolean;
  /** @deprecated Use recordsPermissions.canUpdateAllRecords */
  canUpdateAllObjectRecords?: boolean;
  /** @deprecated Use recordsPermissions.canSoftDeleteAllRecords */
  canSoftDeleteAllObjectRecords?: boolean;
  /** @deprecated Use recordsPermissions.canDestroyAllRecords */
  canDestroyAllObjectRecords?: boolean;
  /** @deprecated Use recordsPermissions.objects */
  objectPermissions?: LegacyObjectPermissionManifest[];
  /** @deprecated Use unreadableFields and uneditableFields in recordsPermissions.objects */
  fieldPermissions?: LegacyFieldPermissionManifest[];
  /** @deprecated Use rowLevelRecordsPermissions in recordsPermissions.objects */
  rowLevelPermissionPredicates?: LegacyRowLevelPermissionPredicateManifest[];
  /** @deprecated Use rowLevelRecordsPermissions in recordsPermissions.objects */
  rowLevelPermissionPredicateGroups?: LegacyRowLevelPermissionPredicateGroupManifest[];
};

export const LEGACY_ROLE_RECORDS_PERMISSIONS_MANIFEST_KEYS = [
  'canReadAllObjectRecords',
  'canUpdateAllObjectRecords',
  'canSoftDeleteAllObjectRecords',
  'canDestroyAllObjectRecords',
  'objectPermissions',
  'fieldPermissions',
  'rowLevelPermissionPredicates',
  'rowLevelPermissionPredicateGroups',
] as const satisfies (keyof LegacyRoleRecordsPermissionsManifest)[];

type RoleManifestBase = SyncableEntityOptions &
  Pick<
    RolePermissionGrants,
    | 'canUpdateAllSettings'
    | 'canAccessAllTools'
    | 'canAccessAllAgentChatChannels'
    | 'permissionFlagUniversalIdentifiers'
  > & {
    label: string;
    description?: string;
    icon?: string;
    canBeAssignedToUsers?: boolean;
    canBeAssignedToAgents?: boolean;
    canBeAssignedToApiKeys?: boolean;
  };

export type RoleManifest = RoleManifestBase & {
  recordsPermissions: RoleRecordsPermissionsManifest & {
    objects: ObjectRecordsPermissionsManifest[];
  };
};

// The deprecated properties are read for manifests built before recordsPermissions
export type LegacyCompliantRoleManifest = RoleManifestBase &
  LegacyRoleRecordsPermissionsManifest & {
    recordsPermissions?: RoleRecordsPermissionsManifest;
  };
