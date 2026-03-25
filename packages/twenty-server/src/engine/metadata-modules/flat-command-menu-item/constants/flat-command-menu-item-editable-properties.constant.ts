import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES = [
  'label',
  'icon',
  'shortLabel',
  'position',
  'isPinned',
  'hotKeys',
  'availabilityType',
  'availabilityObjectMetadataId',
  'engineComponentKey',
] as const satisfies MetadataEntityPropertyName<'commandMenuItem'>[];
