import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutTabMaps } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab-maps.type';
import { transformPageLayoutTabEntityToFlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/utils/transform-page-layout-tab-entity-to-flat-page-layout-tab.util';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutTabMaps')
export class WorkspaceFlatPageLayoutTabMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutTabMaps> {
  constructor(
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPageLayoutTabMaps> {
    const [pageLayoutTabs, pageLayoutWidgets] = await Promise.all([
      await this.pageLayoutTabRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      await this.pageLayoutWidgetRepository.find({
        where: { workspaceId },
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

    const flatPageLayoutTabMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutTabEntity of pageLayoutTabs) {
      const flatPageLayoutTab = transformPageLayoutTabEntityToFlatPageLayoutTab(
        {
          ...pageLayoutTabEntity,
          widgets:
            pageLayoutWidgetsByPageLayoutTabId.get(pageLayoutTabEntity.id) ||
            [],
        } as PageLayoutTabEntity,
      );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayoutTab,
        flatEntityMapsToMutate: flatPageLayoutTabMaps,
      });
    }

    return flatPageLayoutTabMaps;
  }
}
