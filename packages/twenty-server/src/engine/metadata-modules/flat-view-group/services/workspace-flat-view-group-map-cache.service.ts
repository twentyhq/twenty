import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/metadata-modules/flat-entity/constant/empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { FlatViewGroupMaps } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group-maps.type';
import { fromViewGroupEntityToFlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/utils/from-view-group-entity-to-flat-view-group.util';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatViewGroupMaps')
export class WorkspaceFlatViewGroupMapCacheService extends WorkspaceFlatMapCacheService<FlatViewGroupMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatViewGroupMaps> {
    const existingViewGroups = await this.viewGroupRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    return existingViewGroups.reduce((flatViewGroupMaps, viewGroupEntity) => {
      const flatViewGroup = fromViewGroupEntityToFlatViewGroup(viewGroupEntity);

      return addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatViewGroup,
        flatEntityMaps: flatViewGroupMaps,
      });
    }, EMPTY_FLAT_ENTITY_MAPS);
  }
}
