import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { fromViewEntityToFlatView } from 'src/engine/metadata-modules/flat-view/utils/from-view-entity-to-flat-view.util';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewMaps')
export class WorkspaceFlatViewMapCacheService extends WorkspaceCacheProvider<FlatViewMaps> {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewFieldEntity)
    private readonly viewFieldRepository: Repository<ViewFieldEntity>,
    @InjectRepository(ViewFilterEntity)
    private readonly viewFilterRepository: Repository<ViewFilterEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
    @InjectRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: Repository<ViewFilterGroupEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewMaps> {
    const [views, viewFields, viewFilters, viewGroups, viewFilterGroups] =
      await Promise.all([
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
        this.viewFilterGroupRepository.find({
          where: { workspaceId },
          select: ['id', 'viewId'],
          withDeleted: true,
        }),
      ]);

    const [
      viewFieldsByViewId,
      viewFiltersByViewId,
      viewGroupsByViewId,
      viewFilterGroupsByViewId,
    ] = (
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
        {
          entities: viewFilterGroups,
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
        viewFilterGroups: viewFilterGroupsByViewId.get(viewEntity.id) || [],
      } as ViewEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatView,
        flatEntityMapsToMutate: flatViewMaps,
      });
    }

    return flatViewMaps;
  }
}
