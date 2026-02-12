import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { fromIndexMetadataEntityToFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/from-index-metadata-entity-to-flat-index-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { createIdToUniversalIdentifierMap } from 'src/engine/workspace-cache/utils/create-id-to-universal-identifier-map.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatIndexMaps')
export class WorkspaceFlatIndexMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatIndexMetadata>
> {
  constructor(
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
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
  ): Promise<FlatEntityMaps<FlatIndexMetadata>> {
    const [indexes, applications, objectMetadatas, fieldMetadatas] =
      await Promise.all([
        this.indexMetadataRepository.find({
          where: {
            workspaceId,
          },
          withDeleted: true,
          relationLoadStrategy: 'join',
          select: {
            // Note: We need all IndexFieldMetadataEntity in order to build a FlatIndex
            indexFieldMetadatas: true,
          },
          relations: ['indexFieldMetadatas'],
        }),
        this.applicationRepository.find({
          where: { workspaceId },
          select: ['id', 'universalIdentifier'],
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

    const flatIndexMaps = createEmptyFlatEntityMaps();

    for (const indexEntity of indexes) {
      const flatIndex = fromIndexMetadataEntityToFlatIndexMetadata({
        entity: indexEntity,
        applicationIdToUniversalIdentifierMap,
        objectMetadataIdToUniversalIdentifierMap,
        fieldMetadataIdToUniversalIdentifierMap,
      });

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatIndex,
        flatEntityMapsToMutate: flatIndexMaps,
      });
    }

    return flatIndexMaps;
  }
}
