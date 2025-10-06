import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { EMPTY_FLAT_ENTITY_MAPS } from 'src/engine/core-modules/common/constant/empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromObjectMetadataEntityToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-entity-to-flat-object-metadata.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache('flatObjectMetadataMaps')
export class WorkspaceFlatObjectMetadataMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatObjectMetadata>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,

    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatObjectMetadata>> {
    const objectMetadatas = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
      relations: ['fields', 'indexMetadatas'],
    });

    const flatObjectMetadataMaps = objectMetadatas.reduce<
      FlatEntityMaps<FlatObjectMetadata>
    >((flatEntityMaps, object) => {
      const flatObjectMetadata =
        fromObjectMetadataEntityToFlatObjectMetadata(object);

      return {
        byId: {
          ...flatEntityMaps.byId,
          [flatObjectMetadata.id]: flatObjectMetadata,
        },
        idByUniversalIdentifier: {
          ...flatEntityMaps.idByUniversalIdentifier,
          [flatObjectMetadata.universalIdentifier]: flatObjectMetadata.id,
        },
      };
    }, EMPTY_FLAT_ENTITY_MAPS);

    return flatObjectMetadataMaps;
  }
}
