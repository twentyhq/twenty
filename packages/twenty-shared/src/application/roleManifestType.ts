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

// Row-level security declared on the role. A predicate scopes which records the role can
// see/act on (e.g. "the record's owner relation IS the current workspace member"). Predicates
// reference objects and fields by universalIdentifier so they resolve across an upgrade. They
// can optionally belong to a group, which combines its predicates with AND/OR logic.
export type RowLevelPermissionPredicateGroupManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator;
  // Reference another group declared on the same role to nest predicate logic.
  parentPredicateGroupUniversalIdentifier?: string | null;
  position?: number | null;
};

export type RowLevelPermissionPredicateManifest = SyncableEntityOptions & {
  objectUniversalIdentifier: string;
  fieldUniversalIdentifier: string;
  operand: RowLevelPermissionPredicateOperand;
  value?: RowLevelPermissionPredicateValue | null;
  subFieldName?: string | null;
  // The workspaceMember field whose value is injected at query time (e.g. the current member's
  // id). Lets a predicate express "this record belongs to the current member".
  workspaceMemberFieldUniversalIdentifier?: string | null;
  workspaceMemberSubFieldName?: string | null;
  // universalIdentifier of a RowLevelPermissionPredicateGroupManifest declared on the same role.
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
