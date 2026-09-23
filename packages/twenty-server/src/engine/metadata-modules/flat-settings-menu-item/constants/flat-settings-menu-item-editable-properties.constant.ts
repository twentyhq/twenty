import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_SETTINGS_MENU_ITEM_EDITABLE_PROPERTIES = [
  'frontComponentId',
  'title',
  'icon',
  'position',
  'scope',
] as const satisfies MetadataEntityPropertyName<'settingsMenuItem'>[];
