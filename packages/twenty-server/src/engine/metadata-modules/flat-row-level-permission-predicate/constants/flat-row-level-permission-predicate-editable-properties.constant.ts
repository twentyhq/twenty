/* @license Enterprise */

import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_ROW_LEVEL_PERMISSION_PREDICATE_EDITABLE_PROPERTIES = [
  'fieldMetadataId',
  'operand',
  'value',
  'rowLevelPermissionPredicateGroupId',
  'positionInRowLevelPermissionPredicateGroup',
  'subFieldName',
  'workspaceMemberFieldMetadataId',
  'workspaceMemberSubFieldName',
] as const satisfies MetadataEntityPropertyName<'rowLevelPermissionPredicate'>[];
