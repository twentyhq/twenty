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

export type RowLevelPermissionRuleManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  canReadRecords?: boolean;
  canCreateRecords?: boolean;
  canUpdateRecords?: boolean;
  canSoftDeleteRecords?: boolean;
  canDestroyRecords?: boolean;
};

export type RowLevelPermissionPredicateGroupManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  rowLevelPermissionRuleUniversalIdentifier?: string | null;
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
  rowLevelPermissionRuleUniversalIdentifier?: string | null;
  position?: number | null;
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
    rowLevelPermissionRules?: RowLevelPermissionRuleManifest[];
    rowLevelPermissionPredicates?: RowLevelPermissionPredicateManifest[];
    rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupManifest[];
  };
