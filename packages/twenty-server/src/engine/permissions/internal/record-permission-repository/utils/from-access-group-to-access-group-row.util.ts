/* @license Enterprise */

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';

export const fromAccessGroupToAccessGroupRow = (
  accessGroup: AccessGroupWithoutCompactId,
): Omit<AccessGroupRow, 'compactId' | 'memberFieldValues'> & {
  memberFieldValues: string | null;
} => ({
  objectMetadataId: accessGroup.objectMetadataId,
  type: accessGroup.type,
  ruleShapeHash: accessGroup.ruleShapeHash,
  unreadableFieldIds: accessGroup.unreadableFieldIds,
  memberFieldValues:
    accessGroup.type === 'MEMBER_VALUE'
      ? JSON.stringify(accessGroup.memberFieldValues)
      : null,
  valuePredicateKey:
    accessGroup.type === 'LITERAL_VALUE' ? accessGroup.valuePredicateKey : null,
  value: accessGroup.type === 'LITERAL_VALUE' ? accessGroup.value : null,
  groupHash: accessGroup.groupHash,
});
