/* @license Enterprise */

import { type RowLevelPermissionPredicateDTO } from 'src/engine/metadata-modules/row-level-permission-predicate/dtos/row-level-permission-predicate.dto';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const fromFlatRowLevelPermissionPredicateToDto = (
  flatPredicate: FlatRowLevelPermissionPredicate,
): RowLevelPermissionPredicateDTO => ({
  ...flatPredicate,
});
