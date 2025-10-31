import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import {
  SERVERLESS_FUNCTION_ENTITY_RELATION_PROPERTIES,
  ServerlessFunctionEntity,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceFlatMapCache('flatServerlessFunctionMaps')
export class WorkspaceFlatServerlessFunctionMapCacheService extends WorkspaceFlatMapCacheService<
  FlatEntityMaps<FlatServerlessFunction>
> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatEntityMaps<FlatServerlessFunction>> {
    const serverlessFunctions = await this.serverlessFunctionRepository.find({
      where: {
        workspaceId,
      },
      withDeleted: true,
    });

    const flatServerlessFunctionMaps = createEmptyFlatEntityMaps();

    for (const serverlessFunctionEntity of serverlessFunctions) {
      const flatServerlessFunction = {
        ...removePropertiesFromRecord(serverlessFunctionEntity, [
          ...SERVERLESS_FUNCTION_ENTITY_RELATION_PROPERTIES,
        ]),
        universalIdentifier:
          serverlessFunctionEntity.universalIdentifier ??
          serverlessFunctionEntity.id,
      } satisfies FlatServerlessFunction;

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatServerlessFunction,
        flatEntityMapsToMutate: flatServerlessFunctionMaps,
      });
    }

    return flatServerlessFunctionMaps;
  }
}
