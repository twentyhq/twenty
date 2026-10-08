import { type SettingsMenuItemEntity } from 'src/engine/metadata-modules/settings-menu-item/entities/settings-menu-item.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatSettingsMenuItem = UniversalFlatEntityFrom<
  SettingsMenuItemEntity,
  'settingsMenuItem'
>;
