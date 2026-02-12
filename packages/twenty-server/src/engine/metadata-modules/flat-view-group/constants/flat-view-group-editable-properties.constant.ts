import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_GROUP_EDITABLE_PROPERTIES = [
  'isVisible',
  'fieldValue',
  'position',
] as const satisfies MetadataEntityPropertyName<'viewGroup'>[];
