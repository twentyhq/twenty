import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VIEW_FIELD_GROUP_EDITABLE_PROPERTIES = [
  'name',
  'position',
  'isVisible',
  'deletedAt',
] as const satisfies MetadataEntityPropertyName<'viewFieldGroup'>[];
