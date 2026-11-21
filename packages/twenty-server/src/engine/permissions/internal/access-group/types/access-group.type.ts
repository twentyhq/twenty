/* @license Enterprise */

import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export type AccessGroupType =
  | 'ALL_RECORDS'
  | 'RULE'
  | 'MEMBER_VALUE'
  | 'LITERAL_VALUE';

export type AccessGroupSplit =
  | { type: 'ALL_RECORDS' }
  | { type: 'RULE' }
  | { type: 'MEMBER_VALUE'; memberFieldValues: RlsMemberFieldValues }
  | { type: 'LITERAL_VALUE'; value: string };

export type AccessGroupWithoutCompactId = {
  groupHash: string;
  objectMetadataId: string;
  ruleShapeHash: string;
  unreadableFieldIds: string[];
} & AccessGroupSplit;

export type AccessGroup = AccessGroupWithoutCompactId & { compactId: number };
