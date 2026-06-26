import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatSearchFieldMetadataMaps } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata-maps.type';
import { fromSearchFieldMetadataEntityToFlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/from-search-field-metadata-entity-to-flat-search-field-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatSearchFieldMetadataMaps')
export class WorkspaceFlatSearchFieldMetadataMapCacheService extends WorkspaceCacheProvider<FlatSearchFieldMetadataMaps> {
  constructor(
    @InjectWorkspaceScopedRepository(SearchFieldMetadataEntity)
    private readonly searchFieldMetadataRepository: WorkspaceScopedRepository<SearchFieldMetadataEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatSearchFieldMetadataMaps> {
    const [
      existingSearchFieldMetadatas,
      applications,
      objectMetadatas,
      fieldMetadatas,
    ] = await Promise.all([
      this.searchFieldMetadataRepository.find(workspaceId),
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
      this.fieldMetadataRepository.find({
        where: { workspaceId },
        select: ['id', 'universalIdentifier'],
        withDeleted: true,
      }),
    ]);

    const applicationIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(applications);
    const objectMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(objectMetadatas);
    const fieldMetadataIdToUniversalIdentifierMap =
      createIdToUniversalIdentifierMap(fieldMetadatas);

    const flatSearchFieldMetadataMaps = createEmptyFlatEntityMaps();

    for (const searchFieldMetadata of existingSearchFieldMetadatas) {
      const flatSearchFieldMetadata =
        fromSearchFieldMetadataEntityToFlatSearchFieldMetadata({
          entity: searchFieldMetadata,
          applicationIdToUniversalIdentifierMap,
          objectMetadataIdToUniversalIdentifierMap,
          fieldMetadataIdToUniversalIdentifierMap,
        });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatSearchFieldMetadata,
        flatEntityMapsToMutate: flatSearchFieldMetadataMaps,
      });
    }

    return flatSearchFieldMetadataMaps;
  }
}
