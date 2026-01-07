import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { transformPageLayoutEntityToFlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/utils/transform-page-layout-entity-to-flat-page-layout.util';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutMaps')
export class WorkspaceFlatPageLayoutMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutMaps> {
  constructor(
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPageLayoutMaps> {
    const [pageLayouts, pageLayoutTabs] = await Promise.all([
      await this.pageLayoutRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      await this.pageLayoutTabRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
    ]);

    const [pageLayoutTabsByPageLayoutId] = (
      [
        {
          entities: pageLayoutTabs,
          foreignKey: 'pageLayoutId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const flatPageLayoutMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutEntity of pageLayouts) {
      const flatPageLayout = transformPageLayoutEntityToFlatPageLayout({
        ...pageLayoutEntity,
        tabs: pageLayoutTabsByPageLayoutId.get(pageLayoutEntity.id) || [],
      } as PageLayoutEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayout,
        flatEntityMapsToMutate: flatPageLayoutMaps,
      });
    }

    return flatPageLayoutMaps;
  }
}
