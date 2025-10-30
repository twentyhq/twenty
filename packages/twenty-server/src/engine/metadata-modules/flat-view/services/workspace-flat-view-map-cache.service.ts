import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewEntityToFlatView } from 'src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatViewMaps')
export class WorkspaceFlatViewMapCacheService extends WorkspaceFlatMapCacheService<FlatViewMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatViewMaps> {
    const views = await this.viewRepository.find({
      where: {
        workspaceId,
      },
      select: {
        viewFields: {
          id: true,
        },
        viewFilters: {
          id: true,
        },
      },
      relations: ['viewFields', 'viewFilters', 'viewGroups'],
      withDeleted: true,
    });

    const flatViewMaps = EMPTY_FLAT_ENTITY_MAPS();

    for (const viewEntity of views) {
      const flatView = fromViewEntityToFlatView(viewEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatView,
        flatEntityMapsToMutate: flatViewMaps,
      });
    }

    return flatViewMaps;
  }
}
