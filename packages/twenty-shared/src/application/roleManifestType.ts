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
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
  canSoftDeleteAllObjectRecords?: boolean;
  canDestroyAllObjectRecords?: boolean;
  objectPermissions?: LegacyObjectPermissionManifest[];
  fieldPermissions?: LegacyFieldPermissionManifest[];
  rowLevelPermissionPredicates?: LegacyRowLevelPermissionPredicateManifest[];
  rowLevelPermissionPredicateGroups?: LegacyRowLevelPermissionPredicateGroupManifest[];
};

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

export type LegacyCompliantRoleManifest = RoleManifestBase &
  LegacyRoleRecordsPermissionsManifest;
