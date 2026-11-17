/* @license Enterprise */

import { type RowLevelPermissionRuleDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-rule.dto';
import { type FlatRowLevelPermissionRule } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-rule.type';

export const fromFlatRowLevelPermissionRuleToDto = ({
  id,
  objectMetadataId,
  canCreateRecords,
  canReadRecords,
  canUpdateRecords,
  canSoftDeleteRecords,
  canDestroyRecords,
}: FlatRowLevelPermissionRule): RowLevelPermissionRuleDTO => ({
  id,
  objectMetadataId,
  canCreateRecords,
  canReadRecords,
  canUpdateRecords,
  canSoftDeleteRecords,
  canDestroyRecords,
});
