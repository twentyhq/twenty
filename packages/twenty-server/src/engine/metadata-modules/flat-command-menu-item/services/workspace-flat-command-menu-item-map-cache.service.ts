import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { fromCommandMenuItemEntityToFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-entity-to-flat-command-menu-item.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatCommandMenuItemMaps')
export class WorkspaceFlatCommandMenuItemMapCacheService extends WorkspaceCacheProvider<FlatCommandMenuItemMaps> {
  constructor(
    @InjectRepository(CommandMenuItemEntity)
    private readonly commandMenuItemRepository: Repository<CommandMenuItemEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatCommandMenuItemMaps> {
    const commandMenuItems = await this.commandMenuItemRepository.find({
      where: { workspaceId },
      withDeleted: true,
    });

    const flatCommandMenuItemMaps = createEmptyFlatEntityMaps();

    for (const commandMenuItemEntity of commandMenuItems) {
      const flatCommandMenuItem =
        fromCommandMenuItemEntityToFlatCommandMenuItem(commandMenuItemEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatCommandMenuItem,
        flatEntityMapsToMutate: flatCommandMenuItemMaps,
      });
    }

    return flatCommandMenuItemMaps;
  }
}
