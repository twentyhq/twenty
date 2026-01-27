import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { fromServerlessFunctionEntityToFlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/utils/from-serverless-function-entity-to-flat-serverless-function.util';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatServerlessFunctionMaps')
export class WorkspaceFlatServerlessFunctionMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatServerlessFunction>
> {
  constructor(
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatServerlessFunction>> {
    const serverlessFunctions = await this.serverlessFunctionRepository.find({
      where: { workspaceId },
      withDeleted: true,
    });

    const flatServerlessFunctionMaps = createEmptyFlatEntityMaps();

    for (const serverlessFunctionEntity of serverlessFunctions) {
      const flatServerlessFunction =
        fromServerlessFunctionEntityToFlatServerlessFunction(
          serverlessFunctionEntity,
        );

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatServerlessFunction,
        flatEntityMapsToMutate: flatServerlessFunctionMaps,
      });
    }

    return flatServerlessFunctionMaps;
  }
}
