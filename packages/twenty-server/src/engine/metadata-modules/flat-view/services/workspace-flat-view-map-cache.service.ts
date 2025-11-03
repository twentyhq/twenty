import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewEntityToFlatView } from 'src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-flat-map-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatViewMaps')
export class WorkspaceFlatViewMapCacheService extends WorkspaceFlatMapCacheService<FlatViewMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatViewMaps> {
    const [views, viewFields, viewFilters, viewGroups] = await Promise.all([
      this.viewRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.viewFieldRepository.find({
        where: { workspaceId },
        select: ['id', 'viewId'],
        withDeleted: true,
      }),
      this.viewFilterRepository.find({
        where: { workspaceId },
        select: ['id', 'viewId'],
        withDeleted: true,
      }),
      this.viewGroupRepository.find({
        where: { workspaceId },
        select: ['id', 'viewId'],
        withDeleted: true,
      }),
    ]);

    const [viewFieldsByViewId, viewFiltersByViewId, viewGroupsByViewId] = (
      [
        {
          entities: viewFields,
          foreignKey: 'viewId',
        },
        {
          entities: viewFilters,
          foreignKey: 'viewId',
        },
        {
          entities: viewGroups,
          foreignKey: 'viewId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const flatViewMaps = createEmptyFlatEntityMaps();

    for (const viewEntity of views) {
      const flatView = fromViewEntityToFlatView({
        ...viewEntity,
        viewFields: viewFieldsByViewId.get(viewEntity.id) || [],
        viewFilters: viewFiltersByViewId.get(viewEntity.id) || [],
        viewGroups: viewGroupsByViewId.get(viewEntity.id) || [],
      } as ViewEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatView,
        flatEntityMapsToMutate: flatViewMaps,
      });
    }

    return flatViewMaps;
  }
}
