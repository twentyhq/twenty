/* @license Enterprise */

import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
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
    accessGroup.type === 'RLS_MEMBER_VALUE'
      ? JSON.stringify(accessGroup.memberFieldValues)
      : null,
  value: accessGroup.type === 'RLS_LITERAL_VALUE' ? accessGroup.value : null,
  groupHash: accessGroup.groupHash,
});
