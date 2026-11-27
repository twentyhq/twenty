/* @license Enterprise */

import { type AccessGroup } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { findAccessGroupTypeHandler } from 'src/engine/permissions/internal/access-group/utils/find-access-group-type-handler.util';
import { type AccessGroupRow } from 'src/engine/permissions/internal/record-permission-repository/types/access-group-row.type';

export const fromAccessGroupRowToAccessGroup = (
  accessGroupRow: AccessGroupRow,
): AccessGroup => ({
  compactId: accessGroupRow.compactId,
  groupHash: accessGroupRow.groupHash,
  objectMetadataId: accessGroupRow.objectMetadataId,
  ruleShapeHash: accessGroupRow.ruleShapeHash,
  unreadableFieldIds: accessGroupRow.unreadableFieldIds,
  ...findAccessGroupTypeHandler(accessGroupRow.type).fromRow(accessGroupRow),
});
