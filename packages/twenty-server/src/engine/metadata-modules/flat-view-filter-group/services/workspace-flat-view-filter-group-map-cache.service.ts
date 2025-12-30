import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { fromViewFilterGroupEntityToFlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-view-filter-group-entity-to-flat-view-filter-group.util';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFilterGroupMaps')
export class WorkspaceFlatViewFilterGroupMapCacheService extends WorkspaceCacheProvider<FlatViewFilterGroupMaps> {
  constructor(
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewFilterGroupMaps> {
    const viewFilterGroups = await this.viewFilterGroupRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatViewFilterGroupMaps = createEmptyFlatEntityMaps();

    for (const viewFilterGroupEntity of viewFilterGroups) {
      const flatViewFilterGroup =
        fromViewFilterGroupEntityToFlatViewFilterGroup(viewFilterGroupEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFilterGroup,
        flatEntityMapsToMutate: flatViewFilterGroupMaps,
      });
    }

    return flatViewFilterGroupMaps;
  }
}

