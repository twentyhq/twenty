import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_TIMELINE_ACTIVITY_TYPE_EDITABLE_PROPERTIES = [
  'name',
  'label',
  'action',
  'icon',
  'isActive',
] as const satisfies MetadataEntityPropertyName<'timelineActivityType'>[];
