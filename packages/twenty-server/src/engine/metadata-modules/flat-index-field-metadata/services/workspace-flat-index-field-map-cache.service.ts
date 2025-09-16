import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { FlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-field-metadata/types/flat-index-field-metadata.type';
import { fromIndexFieldMetadataEntityToFlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-field-metadata/utils/from-index-field-metadata-entity-to-flat-index-field-metadata.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

export type FlatIndexFieldMaps = {
  byId: Record<string, FlatIndexFieldMetadata>;
  byUniversalIdentifier: Record<string, FlatIndexFieldMetadata>;
};

@Injectable()
@WorkspaceFlatMapCache('flatIndexFieldMaps')
export class WorkspaceFlatIndexFieldMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatIndexFieldMetadata>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(IndexFieldMetadataEntity)
    private readonly indexFieldMetadataRepository: Repository<IndexFieldMetadataEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatIndexFieldMetadata>> {
    const indexFields = await this.indexFieldMetadataRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatIndexFieldMaps: FlatIndexFieldMaps = {
      byId: {},
      byUniversalIdentifier: {},
    };

    for (const indexField of indexFields) {
      const flatIndexField =
        fromIndexFieldMetadataEntityToFlatIndexFieldMetadata(indexField);

      flatIndexFieldMaps.byId[indexField.id] = flatIndexField;
      flatIndexFieldMaps.byUniversalIdentifier[
        flatIndexField.universalIdentifier
      ] = flatIndexField;
    }

    return flatIndexFieldMaps;
  }
}
