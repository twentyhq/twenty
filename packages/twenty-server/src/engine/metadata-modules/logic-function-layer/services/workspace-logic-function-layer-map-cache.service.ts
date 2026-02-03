import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';
import { type LogicFunctionLayerCacheMaps } from 'src/engine/metadata-modules/logic-function-layer/types/logic-function-layer-cache-maps.type';
import { fromLogicFunctionLayerEntityToFlatLogicFunctionLayer } from 'src/engine/metadata-modules/logic-function-layer/utils/from-logic-function-layer-entity-to-flat-logic-function-layer.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';

@Injectable()
@WorkspaceCache('logicFunctionLayerMaps')
export class WorkspaceLogicFunctionLayerMapCacheService extends WorkspaceCacheProvider<LogicFunctionLayerCacheMaps> {
  constructor(
    @InjectRepository(LogicFunctionLayerEntity)
    private readonly logicFunctionLayerRepository: Repository<LogicFunctionLayerEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<LogicFunctionLayerCacheMaps> {
    const logicFunctionLayerEntities =
      await this.logicFunctionLayerRepository.find({
        where: {
          workspaceId,
        },
      });

    const logicFunctionLayerMaps: LogicFunctionLayerCacheMaps = {
      byId: {},
    };

    for (const entity of logicFunctionLayerEntities) {
      const flatLogicFunctionLayer =
        fromLogicFunctionLayerEntityToFlatLogicFunctionLayer(entity);

      logicFunctionLayerMaps.byId[flatLogicFunctionLayer.id] =
        flatLogicFunctionLayer;
    }

    return logicFunctionLayerMaps;
  }
}
