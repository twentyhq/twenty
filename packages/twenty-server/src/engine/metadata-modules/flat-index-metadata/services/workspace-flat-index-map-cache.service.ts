import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { fromIndexMetadataEntityToFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/from-index-metadata-entity-to-flat-index-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatIndexMaps')
export class WorkspaceFlatIndexMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatIndexMetadata>
> {
  constructor(
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatIndexMetadata>> {
    const indexes = await this.indexMetadataRepository.find({
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
    });

    const flatIndexMaps = createEmptyFlatEntityMaps();

    for (const indexEntity of indexes) {
      const flatIndex = fromIndexMetadataEntityToFlatIndexMetadata(indexEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatIndex,
        flatEntityMapsToMutate: flatIndexMaps,
      });
    }

    return flatIndexMaps;
  }
}
