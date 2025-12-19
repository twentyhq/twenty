import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { fromPageLayoutWidgetEntityToFlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-entity-to-flat-page-layout-widget.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutWidgetMaps')
export class WorkspaceFlatPageLayoutWidgetMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutWidgetMaps> {
  constructor(
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatPageLayoutWidgetMaps> {
    const existingPageLayoutWidgets =
      await this.pageLayoutWidgetRepository.find({
        where: {
          workspaceId,
        },
        withDeleted: true,
      });

    const flatPageLayoutWidgetMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutWidgetEntity of existingPageLayoutWidgets) {
      const flatPageLayoutWidget =
        fromPageLayoutWidgetEntityToFlatPageLayoutWidget(
          pageLayoutWidgetEntity,
        );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayoutWidget,
        flatEntityMapsToMutate: flatPageLayoutWidgetMaps,
      });
    }

    return flatPageLayoutWidgetMaps;
  }
}
