import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { type ServerlessFunctionLayerCacheMaps } from 'src/engine/metadata-modules/serverless-function-layer/types/serverless-function-layer-cache-maps.type';
import { fromServerlessFunctionLayerEntityToFlatServerlessFunctionLayer } from 'src/engine/metadata-modules/serverless-function-layer/utils/from-serverless-function-layer-entity-to-flat-serverless-function-layer.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('serverlessFunctionLayerMaps')
export class WorkspaceServerlessFunctionLayerMapCacheService extends WorkspaceCacheProvider<ServerlessFunctionLayerCacheMaps> {
  constructor(
    @InjectRepository(ServerlessFunctionLayerEntity)
    private readonly serverlessFunctionLayerRepository: Repository<ServerlessFunctionLayerEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<ServerlessFunctionLayerCacheMaps> {
    const serverlessFunctionLayerEntities =
      await this.serverlessFunctionLayerRepository.find({
        where: {
          workspaceId,
        },
      });

    const serverlessFunctionLayerMaps: ServerlessFunctionLayerCacheMaps = {
      byId: {},
    };

    for (const entity of serverlessFunctionLayerEntities) {
      const flatServerlessFunctionLayer =
        fromServerlessFunctionLayerEntityToFlatServerlessFunctionLayer(entity);

      serverlessFunctionLayerMaps.byId[flatServerlessFunctionLayer.id] =
        flatServerlessFunctionLayer;
    }

    return serverlessFunctionLayerMaps;
  }
}
