import { type RecordShareAccessLevel } from '@/types/RecordShareAccessLevel';
import { type RecordPermissionAction } from '@/types/RecordPermissionAction';
import { type RowLevelPermissionPredicateOperand } from '@/types/RowLevelPermissionPredicateOperand';
import { type RowLevelPermissionPredicateValue } from '@/types/RowLevelPermissionPredicateValue';

export type RecordPermissionPredicate = {
  kind: 'predicate';
  fieldUniversalIdentifier: string;
  operand: RowLevelPermissionPredicateOperand;
  value: RowLevelPermissionPredicateValue;
  subFieldName?: string | null;
  memberFieldUniversalIdentifier?: string | null;
  memberSubFieldName?: string | null;
};

export type RecordPermissionCondition =
  | RecordPermissionPredicate
  | {
      kind: 'all' | 'any';
      conditions: RecordPermissionCondition[];
    };

export type RecordPermissionRule = {
  universalIdentifier: string;
  label: string;
  roleUniversalIdentifier: string;
  actions: RecordPermissionAction[];
  shareAccessLevel?: RecordShareAccessLevel;
  condition: RecordPermissionCondition | null;
};

export type RecordPermissionInheritancePath = {
  universalIdentifier: string;
  sourceObjectUniversalIdentifier: string;
  fieldUniversalIdentifiers: string[];
};

export type ObjectRecordPermissionPolicy = {
  objectUniversalIdentifier: string;
  rules: RecordPermissionRule[];
  inheritancePaths: RecordPermissionInheritancePath[];
  defaultOverrideRoleUniversalIdentifiers?: string[];
};

export type RecordPermissionPolicyDefinition = {
  version: 1;
  defaults?: (RecordPermissionRule & { condition: null })[];
  objects: ObjectRecordPermissionPolicy[];
};

export type RecordPermissionRevisionStatus =
  | 'building'
  | 'active'
  | 'retired'
  | 'failed'
  | 'cancelled';

export type RecordPermissionExplanationSource = {
  id: string;
  accessGroupId: string;
  ruleUniversalIdentifier: string;
  conditional: boolean;
  kind: 'rule' | 'share';
  sourceObjectUniversalIdentifier: string;
  fieldUniversalIdentifiers: string[];
};

export type RecordPermissionExplanation = {
  allowed: boolean;
  reason: 'capability' | 'noGrant' | null;
  action: RecordPermissionAction;
  sources: RecordPermissionExplanationSource[];
  hasMoreSources: boolean;
};
