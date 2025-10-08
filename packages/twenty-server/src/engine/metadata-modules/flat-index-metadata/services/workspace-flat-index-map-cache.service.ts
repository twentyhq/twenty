import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { fromIndexMetadataEntityToFlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/utils/from-index-metadata-entity-to-flat-index-metadata.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatIndexMaps')
export class WorkspaceFlatIndexMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatIndexMetadata>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatIndexMetadata>> {
    const indexes = await this.indexMetadataRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
      select: {
        indexFieldMetadatas: {
          id: true,
        },
      },
      relations: ['indexFieldMetadatas'],
    });

    return indexes.reduce((flatIndexMaps, indexEntity) => {
      const flatIndex = fromIndexMetadataEntityToFlatIndexMetadata(indexEntity);

      return addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatIndex,
        flatEntityMaps: flatIndexMaps,
      });
    }, EMPTY_FLAT_ENTITY_MAPS);
  }
}
