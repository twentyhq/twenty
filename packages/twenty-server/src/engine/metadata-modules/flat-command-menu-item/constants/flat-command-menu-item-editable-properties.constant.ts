import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';

export const FLAT_COMMAND_MENU_ITEM_EDITABLE_PROPERTIES = [
  'label',
  'icon',
  'isPinned',
  'availabilityType',
  'availabilityObjectMetadataId',
] as const satisfies (keyof FlatCommandMenuItem)[];
