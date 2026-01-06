/* @license Enterprise */

import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';

export const FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES = [
  'operand',
  'value',
  'rowLevelPermissionPredicateGroupId',
  'positionInRowLevelPermissionPredicateGroup',
  'subFieldName',
  'workspaceMemberFieldMetadataId',
  'workspaceMemberSubFieldName',
] as const satisfies (keyof FlatRowLevelPermissionPredicate)[];
