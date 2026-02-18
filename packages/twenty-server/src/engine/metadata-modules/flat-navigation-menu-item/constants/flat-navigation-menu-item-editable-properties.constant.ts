import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_NAVIGATION_MENU_ITEM_EDITABLE_PROPERTIES = [
  'position',
  'folderId',
  'name',
  'link',
  'icon',
] as const satisfies MetadataEntityPropertyName<'navigationMenuItem'>[];
