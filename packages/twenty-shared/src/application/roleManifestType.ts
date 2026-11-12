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

export type ObjectPermissionManifest = Partial<SyncableEntityOptions> &
  ObjectPermissionGrant;

export type FieldPermissionManifest = Partial<SyncableEntityOptions> &
  FieldPermissionGrant;

export type RowLevelPermissionPredicateGroupManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  parentPredicateGroupUniversalIdentifier?: string | null;
  position?: number | null;
};

export type RowLevelPermissionPredicateManifest = SyncableEntityOptions & {
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
  RowLevelPermissionPredicateManifest,
  'objectUniversalIdentifier' | 'predicateGroupUniversalIdentifier'
>;

export type RowLevelPermissionRulePredicateGroupManifest =
  SyncableEntityOptions & {
    logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
    position?: number | null;
    predicates?: RowLevelPermissionRulePredicateManifest[];
    predicateGroups?: RowLevelPermissionRulePredicateGroupManifest[];
  };

export type RowLevelRecordsPermissionsManifest = SyncableEntityOptions & {
  canReadRecords?: boolean;
  canCreateRecords?: boolean;
  canUpdateRecords?: boolean;
  canSoftDeleteRecords?: boolean;
  canDestroyRecords?: boolean;
  predicates?: RowLevelPermissionRulePredicateManifest[];
  predicateGroups?: RowLevelPermissionRulePredicateGroupManifest[];
};

export type ObjectRecordsPermissionsManifest =
  Partial<SyncableEntityOptions> & {
    objectUniversalIdentifier: string;
    canReadAllRecords?: boolean;
    canCreateAllRecords?: boolean;
    canUpdateAllRecords?: boolean;
    canSoftDeleteAllRecords?: boolean;
    canDestroyAllRecords?: boolean;
    rowLevelRecordsPermissions?: RowLevelRecordsPermissionsManifest[];
  };

export type RowLevelPermissionRuleManifest =
  RowLevelRecordsPermissionsManifest & {
    objectUniversalIdentifier: string;
  };

export type RoleManifest = SyncableEntityOptions &
  Omit<RolePermissionGrants, 'objectPermissions' | 'fieldPermissions'> & {
    label: string;
    description?: string;
    icon?: string;
    canBeAssignedToUsers?: boolean;
    canBeAssignedToAgents?: boolean;
    canBeAssignedToApiKeys?: boolean;
    objectPermissions?: ObjectPermissionManifest[];
    fieldPermissions?: FieldPermissionManifest[];
    objectRecordsPermissions?: ObjectRecordsPermissionsManifest[];
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateManifest[];
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupManifest[];
  };
