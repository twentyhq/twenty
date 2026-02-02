import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { transformPageLayoutEntityToFlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/utils/transform-page-layout-entity-to-flat-page-layout.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutMaps')
export class WorkspaceFlatPageLayoutMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutMaps> {
  constructor(
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatPageLayoutMaps> {
    const [pageLayouts, pageLayoutTabs, applications, objectMetadatas] =
      await Promise.all([
        this.pageLayoutRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.pageLayoutTabRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier', 'pageLayoutId'],
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.objectMetadataRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
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

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const pageLayoutTabIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayoutTabs);

    const flatPageLayoutMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutEntity of pageLayouts) {
      const flatPageLayout = transformPageLayoutEntityToFlatPageLayout({
        entity: {
          ...pageLayoutEntity,
          tabs: pageLayoutTabsByPageLayoutId.get(pageLayoutEntity.id) || [],
        },
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        pageLayoutTabIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayout,
        flatEntityMapsToMutate: flatPageLayoutMaps,
      });
    }

    return flatPageLayoutMaps;
  }
}
