import { Injectable } from '@nestjs/common';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CommandMenuItemEntity } from 'src/engine/metadata-modules/command-menu-item/entities/command-menu-item.entity';
import { type FlatCommandMenuItemMaps } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item-maps.type';
import { fromCommandMenuItemEntityToFlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/utils/from-command-menu-item-entity-to-flat-command-menu-item.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { WorkspaceCacheRecomputeContext } from 'src/engine/workspace-cache/services/workspace-cache-recompute-context';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatCommandMenuItemMaps', { packingPonderation: 4 })
export class WorkspaceFlatCommandMenuItemMapCacheService extends WorkspaceCacheProvider<FlatCommandMenuItemMaps> {
  async computeForCache(
    workspaceId: string,
    recomputeContext: WorkspaceCacheRecomputeContext,
  ): Promise<FlatCommandMenuItemMaps> {
    const [
      commandMenuItems,
      applications,
      objectMetadatas,
      frontComponents,
      pageLayouts,
    ] = await Promise.all([
      recomputeContext.findAll(CommandMenuItemEntity),
      recomputeContext.findAll(ApplicationEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(ObjectMetadataEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(FrontComponentEntity, [
        'id',
        'universalIdentifier',
      ]),
      recomputeContext.findAll(PageLayoutEntity, ['id', 'universalIdentifier']),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const frontComponentIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(frontComponents);
    const pageLayoutIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayouts);

    const flatCommandMenuItemMaps = createEmptyFlatEntityMaps();

    for (const commandMenuItemEntity of commandMenuItems) {
      const flatCommandMenuItem =
        fromCommandMenuItemEntityToFlatCommandMenuItem({
          entity: commandMenuItemEntity,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          frontComponentIdToUniversalIdentifierMap,
          pageLayoutIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatCommandMenuItem,
        flatEntityMapsToMutate: flatCommandMenuItemMaps,
      });
    }

    return flatCommandMenuItemMaps;
  }
}
