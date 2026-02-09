import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_FIELD_EDITABLE_PROPERTIES = [
  'isVisible',
  'size',
  'position',
  'aggregateOperation',
] as const satisfies MetadataEntityPropertyName<'viewField'>[];
