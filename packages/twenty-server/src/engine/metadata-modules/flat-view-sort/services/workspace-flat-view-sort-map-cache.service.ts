import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { FlatViewSortMaps } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort-maps.type';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { fromViewSortEntityToFlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/utils/from-view-sort-entity-to-flat-view-sort.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';

@Injectable()
@WorkspaceCache('flatViewSortMaps')
export class WorkspaceFlatViewSortMapCacheService extends WorkspaceCacheProvider<FlatViewSortMaps> {
  constructor(
    @InjectRepository(ViewSortEntity)
    private readonly viewSortRepository: Repository<ViewSortEntity>,
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<FlatViewSortMaps> {
    const [existingViewSorts, applications, views, fieldMetadatas] =
      await Promise.all([
        this.viewSortRepository.find({
          where: { workspaceId },
          withDeleted: true,
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
          withDeleted: true,
        }),
        this.viewRepository.find({
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
    const viewIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(views);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatViewSortMaps = createEmptyFlatEntityMaps();

    for (const viewSort of existingViewSorts) {
      const flatViewSort = fromViewSortEntityToFlatViewSort({
        entity: viewSort,
        applicationIdToUniversalIdentifierMap,
        viewIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatViewSort,
        flatEntityMapsToMutate: flatViewSortMaps,
      });
    }

    return flatViewSortMaps;
  }
}
