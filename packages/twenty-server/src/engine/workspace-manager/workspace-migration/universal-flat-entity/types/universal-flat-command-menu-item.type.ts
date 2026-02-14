import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatCommandMenuItem = UniversalFlatEntityFrom<
  CommandMenuItemEntity,
  'commandMenuItem'
>;
