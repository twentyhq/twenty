import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_TAB_EDITABLE_PROPERTIES = [
  'isVisible',
  'fieldValue',
  'name',
  'position',
] as const satisfies MetadataEntityPropertyName<'viewTab'>[];
