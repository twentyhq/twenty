import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES = [
  'parentViewFilterGroupId',
  'logicalOperator',
  'positionInViewFilterGroup',
] as const satisfies MetadataEntityPropertyName<'viewFilterGroup'>[];
