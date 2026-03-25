import { type CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';

export type FlatCommandMenuItem = FlatEntityFrom<CommandMenuItemEntity>;
