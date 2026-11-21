/* @license Enterprise */

import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export type AccessGroupType =
  | 'ALL_RECORDS'
  | 'RULE'
  | 'MEMBER_VALUE'
  | 'LITERAL_VALUE';

export type AccessGroupWithoutCompactId = {
  groupHash: string;
  objectMetadataId: string;
  ruleShapeHash: string;
  unreadableFieldIds: string[];
} & (
  | { type: 'ALL_RECORDS' }
  | { type: 'RULE' }
  | { type: 'MEMBER_VALUE'; memberFieldValues: RlsMemberFieldValues }
  | { type: 'LITERAL_VALUE'; valuePredicateKey: string; value: string }
);

export type AccessGroup = AccessGroupWithoutCompactId & { compactId: number };
