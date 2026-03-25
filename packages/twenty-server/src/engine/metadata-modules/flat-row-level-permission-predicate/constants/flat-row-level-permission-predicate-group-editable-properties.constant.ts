/* @license Enterprise */

import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_ROW_LEVEL_PERMISSION_PREDICATE_GROUP_EDITABLE_PROPERTIES = [
  'logicalOperator',
  'positionInRowLevelPermissionPredicateGroup',
  'parentRowLevelPermissionPredicateGroupId',
] as const satisfies MetadataEntityPropertyName<'rowLevelPermissionPredicateGroup'>[];
