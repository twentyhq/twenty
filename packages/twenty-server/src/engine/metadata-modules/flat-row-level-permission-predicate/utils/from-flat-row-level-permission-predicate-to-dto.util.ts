/* @license Enterprise */

import { type RoleFlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/flat-row-level-permission-predicate/utils/is-role-flat-row-level-permission-predicate.util';
import { type RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';

export const fromFlatRowLevelPermissionPredicateToDto = (
  flatPredicate: RoleFlatRowLevelPermissionPredicate,
): RowLevelPermissionPredicateDTO => ({
  ...flatPredicate,
});
