import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { fromCommandMenuItemEntityToFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-entity-to-flat-command-menu-item.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatCommandMenuItemMaps')
export class WorkspaceFlatCommandMenuItemMapCacheService extends WorkspaceCacheProvider<FlatCommandMenuItemMaps> {
  constructor(
    @InjectRepository(CommandMenuItemEntity)
    private readonly commandMenuItemRepository: Repository<CommandMenuItemEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FrontComponentEntity)
    private readonly frontComponentRepository: Repository<FrontComponentEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatCommandMenuItemMaps> {
    const [commandMenuItems, applications, objectMetadatas, frontComponents] =
      await Promise.all([
        this.commandMenuItemRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.objectMetadataRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.frontComponentRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
      ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const frontComponentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(frontComponents);

    const flatCommandMenuItemMaps = createEmptyFlatEntityMaps();

    for (const commandMenuItemEntity of commandMenuItems) {
      const flatCommandMenuItem =
        fromCommandMenuItemEntityToFlatCommandMenuItem({
          entity: commandMenuItemEntity,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          frontComponentIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatCommandMenuItem,
        flatEntityMapsToMutate: flatCommandMenuItemMaps,
      });
    }

    return flatCommandMenuItemMaps;
  }
}
