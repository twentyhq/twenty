import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type RowLevelPermissionPredicateGroupLogicalOperator,
  type RowLevelPermissionPredicateOperand,
  type RowLevelPermissionPredicateValue,
} from '@/types';

export type ObjectPermissionManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  canReadObjectRecords?: boolean;
  canUpdateObjectRecords?: boolean;
  canSoftDeleteObjectRecords?: boolean;
  canDestroyObjectRecords?: boolean;
};

export type FieldPermissionManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  canReadFieldValue?: boolean;
  canUpdateFieldValue?: boolean;
};

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
  rowLevelPermissionPredicates?: RowLevelPermissionPredicateManifest[];
  rowLevelPermissionPredicateGroups?: RowLevelPermissionPredicateGroupManifest[];
  permissionFlagUniversalIdentifiers?: string[];
};
