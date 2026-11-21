/* @license Enterprise */

import { type AccessGroupType } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type RlsMemberFieldValues } from 'src/engine/permissions/internal/rls/types/rls-member-field-values.type';

export type AccessGroupRow = {
  compactId: number;
  groupHash: string;
  objectMetadataId: string;
  type: AccessGroupType;
  ruleShapeHash: string;
  unreadableFieldIds: string[];
  memberFieldValues: RlsMemberFieldValues | null;
  valuePredicateKey: string | null;
  value: string | null;
};
