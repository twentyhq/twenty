import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatPageLayoutWidgetMaps } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget-maps.type';
import { fromPageLayoutWidgetEntityToFlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-entity-to-flat-page-layout-widget.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatPageLayoutWidgetMaps')
export class WorkspaceFlatPageLayoutWidgetMapCacheService extends WorkspaceCacheProvider<FlatPageLayoutWidgetMaps> {
  constructor(
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatPageLayoutWidgetMaps> {
    const [
      existingPageLayoutWidgets,
      applications,
      pageLayoutTabs,
      objectMetadatas,
      fieldMetadatas,
    ] = await Promise.all([
      this.pageLayoutWidgetRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.applicationRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.pageLayoutTabRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.objectMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const pageLayoutTabIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(pageLayoutTabs);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataUniversalIdentifierById = Object.fromEntries(
      createIdToUniversalIdentifierMap(fieldMetadatas),
    );

    const flatPageLayoutWidgetMaps = createEmptyFlatEntityMaps();

    for (const pageLayoutWidgetEntity of existingPageLayoutWidgets) {
      const flatPageLayoutWidget =
        fromPageLayoutWidgetEntityToFlatPageLayoutWidget({
          entity: pageLayoutWidgetEntity,
          applicationIdToUniversalIdentifierMap,
          pageLayoutTabIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataUniversalIdentifierById,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatPageLayoutWidget,
        flatEntityMapsToMutate: flatPageLayoutWidgetMaps,
      });
    }

    return flatPageLayoutWidgetMaps;
  }
}
