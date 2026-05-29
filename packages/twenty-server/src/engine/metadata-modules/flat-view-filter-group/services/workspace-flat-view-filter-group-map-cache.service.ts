import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatViewFilterGroupMaps } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group-maps.type';
import { fromViewFilterGroupEntityToFlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/utils/from-view-filter-group-entity-to-flat-view-filter-group.util';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatViewFilterGroupMaps')
export class WorkspaceFlatViewFilterGroupMapCacheService extends WorkspaceCacheProvider<FlatViewFilterGroupMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(ViewFilterGroupEntity)
    private readonly viewFilterGroupRepository: WorkspaceScopedRepository<ViewFilterGroupEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectWorkspaceScopedRepository(ViewFilterEntity)
    private readonly viewFilterRepository: WorkspaceScopedRepository<ViewFilterEntity>,
    @InjectWorkspaceScopedRepository(ViewEntity)
    private readonly viewRepository: WorkspaceScopedRepository<ViewEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewFilterGroupMaps> {
    const [viewFilterGroups, applications, viewFilters, views] =
      await Promise.all([
        this.viewFilterGroupRepository.find(workspaceId, {
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.viewFilterRepository.find(workspaceId, {
          select: ['id', 'universalIdentifier', 'viewFilterGroupId'],
          withDeleted: true,
        }),
        this.viewRepository.find(workspaceId, {
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
      ]);

    const [viewFiltersByViewFilterGroupId, childViewFilterGroupsByParentId] = (
      [
        {
          entities: viewFilters,
          foreignKey: 'viewFilterGroupId',
        },
        {
          entities: viewFilterGroups,
          foreignKey: 'parentViewFilterGroupId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const viewFilterGroupIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(viewFilterGroups);
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);

    const flatViewFilterGroupMaps = createEmptyFlatEntityMaps();

    for (const viewFilterGroupEntity of viewFilterGroups) {
      const flatViewFilterGroup =
        fromViewFilterGroupEntityToFlatViewFilterGroup({
          entity: {
            ...viewFilterGroupEntity,
            viewFilters:
              viewFiltersByViewFilterGroupId.get(viewFilterGroupEntity.id) ||
              [],
            childViewFilterGroups:
              childViewFilterGroupsByParentId.get(viewFilterGroupEntity.id) ||
              [],
          },
          applicationIdToUniversalIdentifierMap,
          viewFilterGroupIdToUniversalIdentifierMap,
          viewIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewFilterGroup,
        flatEntityMapsToMutate: flatViewFilterGroupMaps,
      });
    }

    return flatViewFilterGroupMaps;
  }
}
