import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { fromViewGroupEntityToFlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/utils/from-view-group-entity-to-flat-view-group.util';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewGroupMaps')
export class WorkspaceFlatViewGroupMapCacheService extends WorkspaceCacheProvider<FlatViewGroupMaps> {
  constructor(
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewGroupMaps> {
    const existingViewGroups = await this.viewGroupRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatViewGroupMaps = createEmptyFlatEntityMaps();

    for (const viewGroupEntity of existingViewGroups) {
      const flatViewGroup = fromViewGroupEntityToFlatViewGroup(viewGroupEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewGroup,
        flatEntityMapsToMutate: flatViewGroupMaps,
      });
    }

    return flatViewGroupMaps;
  }
}
