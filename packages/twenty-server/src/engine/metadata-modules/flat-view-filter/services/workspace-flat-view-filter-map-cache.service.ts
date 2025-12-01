import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterMaps } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter-maps.type';
import { fromViewFilterEntityToFlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/utils/from-view-filter-entity-to-flat-view-filter.util';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFilterMaps')
export class WorkspaceFlatViewFilterMapCacheService extends WorkspaceCacheProvider<FlatViewFilterMaps> {
  constructor(
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewFilterMaps> {
    const viewFilters = await this.viewFilterRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatViewFilterMaps = createEmptyFlatEntityMaps();

    for (const viewFilterEntity of viewFilters) {
      const flatViewFilter =
        fromViewFilterEntityToFlatViewFilter(viewFilterEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFilter,
        flatEntityMapsToMutate: flatViewFilterMaps,
      });
    }

    return flatViewFilterMaps;
  }
}
