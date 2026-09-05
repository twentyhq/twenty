/* @license Enterprise */

import { type RoleFlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/is-role-flat-row-level-permission-predicate.util';
import { type RowLevelPermissionPredicateGroupDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate-group.dto';

export const fromFlatRowLevelPermissionPredicateGroupToDto = (
  flatGroup: RoleFlatRowLevelPermissionPredicateGroup,
): RowLevelPermissionPredicateGroupDTO => ({
  ...flatGroup,
});
