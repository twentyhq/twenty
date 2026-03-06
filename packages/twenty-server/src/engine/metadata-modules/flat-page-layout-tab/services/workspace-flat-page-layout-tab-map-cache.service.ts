import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { transformPageLayoutTabEntityToFlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/transform-page-layout-tab-entity-to-flat-page-layout-tab.util';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutTabMaps')
export class WorkspaceFlatPageLayoutTabMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutTabMaps> {
  constructor(
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPageLayoutTabMaps> {
    const [pageLayoutTabs, pageLayoutWidgets, applications, pageLayouts] =
      await Promise.all([
        this.pageLayoutTabRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.pageLayoutWidgetRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier', 'pageLayoutTabId'],
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.pageLayoutRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
      ]);

    const [pageLayoutWidgetsByPageLayoutTabId] = (
      [
        {
          entities: pageLayoutWidgets,
          foreignKey: 'pageLayoutTabId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const pageLayoutIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayouts);

    const flatPageLayoutTabMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutTabEntity of pageLayoutTabs) {
      const flatPageLayoutTab = transformPageLayoutTabEntityToFlatPageLayoutTab(
        {
          entity: {
            ...pageLayoutTabEntity,
            widgets:
              pageLayoutWidgetsByPageLayoutTabId.get(pageLayoutTabEntity.id) ||
              [],
          },
          applicationIdToUniversalIdentifierMap,
          pageLayoutIdToUniversalIdentifierMap,
        },
      );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayoutTab,
        flatEntityMapsToMutate: flatPageLayoutTabMaps,
      });
    }

    return flatPageLayoutTabMaps;
  }
}
