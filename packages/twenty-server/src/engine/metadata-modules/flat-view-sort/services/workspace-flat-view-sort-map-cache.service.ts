import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { fromViewSortEntityToFlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/utils/from-view-sort-entity-to-flat-view-sort.util';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewSortMaps')
export class WorkspaceFlatViewSortMapCacheService extends WorkspaceCacheProvider<FlatViewSortMaps> {
  constructor(
    @InjectRepository(ViewSortEntity)
    private readonly viewSortRepository: Repository<ViewSortEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewSortMaps> {
    const existingViewSorts = await this.viewSortRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatViewSortMaps = createEmptyFlatEntityMaps();

    for (const viewSortEntity of existingViewSorts) {
      const flatViewSort = fromViewSortEntityToFlatViewSort(viewSortEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewSort,
        flatEntityMapsToMutate: flatViewSortMaps,
      });
    }

    return flatViewSortMaps;
  }
}
