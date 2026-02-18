/* @license Enterprise */

import { type RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const fromFlatRowLevelPermissionPredicateGroupToDto = (
  flatGroup: FlatRowLevelPermissionPredicateGroup,
): RowLevelPermissionPredicateGroupDTO => ({
  ...flatGroup,
});
