/* @license Enterprise */

import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';

export const FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES = [
  'logicalOperator',
  'positionInRowLevelPermissionPredicateGroup',
  'parentRowLevelPermissionPredicateGroupId',
] as const satisfies (keyof FlatRowLevelPermissionPredicateGroup)[];
