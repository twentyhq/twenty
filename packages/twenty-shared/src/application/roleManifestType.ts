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

export type DeprecatedObjectPermissionManifest =
  Partial<SyncableEntityOptions> & ObjectPermissionGrant;

export type DeprecatedFieldPermissionManifest = Partial<SyncableEntityOptions> &
  FieldPermissionGrant;

export type DeprecatedRowLevelPermissionPredicateGroupManifest =
  SyncableEntityOptions & {
    objectUniversalIdentifier: string;
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
    parentPredicateGroupUniversalIdentifier?: string | null;
    position?: number | null;
  };

export type DeprecatedRowLevelPermissionPredicateManifest =
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
  DeprecatedRowLevelPermissionPredicateManifest,
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

export type DeprecatedRoleRecordsPermissionsManifest = {
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
  canSoftDeleteAllObjectRecords?: boolean;
  canDestroyAllObjectRecords?: boolean;
  objectPermissions?: DeprecatedObjectPermissionManifest[];
  fieldPermissions?: DeprecatedFieldPermissionManifest[];
  rowLevelPermissionPredicates?: DeprecatedRowLevelPermissionPredicateManifest[];
  rowLevelPermissionPredicateGroups?: DeprecatedRowLevelPermissionPredicateGroupManifest[];
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

export type NormalizedRoleManifest = RoleManifestBase & {
  recordsPermissions: RoleRecordsPermissionsManifest & {
    objects: ObjectRecordsPermissionsManifest[];
  };
};

export type RoleManifest = RoleManifestBase &
  DeprecatedRoleRecordsPermissionsManifest;
