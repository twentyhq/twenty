import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { fromServerlessFunctionEntityToFlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/utils/from-serverless-function-entity-to-flat-serverless-function.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { regroupEntitiesByRelatedEntityId } from 'src/engine/workspace-cache/utils/regroup-entities-by-related-entity-id';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatServerlessFunctionMaps')
export class WorkspaceFlatServerlessFunctionMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatServerlessFunction>
> {
  constructor(
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
    @InjectRepository(DatabaseEventTriggerEntity)
    private readonly databaseEventTriggerRepository: Repository<DatabaseEventTriggerEntity>,
    @InjectRepository(CronTriggerEntity)
    private readonly cronTriggerRepository: Repository<CronTriggerEntity>,
    @InjectRepository(RouteTriggerEntity)
    private readonly routeTriggerRepository: Repository<RouteTriggerEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatServerlessFunction>> {
    const [
      serverlessFunctions,
      routeTriggers,
      cronTriggers,
      databaseEventTriggers,
    ] = await Promise.all([
      this.serverlessFunctionRepository.find({
        where: { workspaceId },
        withDeleted: true,
      }),
      this.cronTriggerRepository.find({
        where: { workspaceId },
        select: ['id', 'serverlessFunctionId'],
        withDeleted: true,
      }),
      this.routeTriggerRepository.find({
        where: { workspaceId },
        select: ['id', 'serverlessFunctionId'],
        withDeleted: true,
      }),
      this.databaseEventTriggerRepository.find({
        where: { workspaceId },
        select: ['id', 'serverlessFunctionId'],
        withDeleted: true,
      }),
    ]);

    const [
      routeTriggersByServerlessFunctionId,
      cronTriggersByServerlessFunctionId,
      databaseEventTriggersByServerlessFunctionId,
    ] = (
      [
        {
          entities: routeTriggers,
          foreignKey: 'serverlessFunctionId',
        },
        {
          entities: cronTriggers,
          foreignKey: 'serverlessFunctionId',
        },
        {
          entities: databaseEventTriggers,
          foreignKey: 'serverlessFunctionId',
        },
      ] as const
    ).map(regroupEntitiesByRelatedEntityId);

    const flatServerlessFunctionMaps = createEmptyFlatEntityMaps();

    for (const serverlessFunctionEntity of serverlessFunctions) {
      const flatServerlessFunction =
        fromServerlessFunctionEntityToFlatServerlessFunction({
          ...serverlessFunctionEntity,
          routeTriggers:
            routeTriggersByServerlessFunctionId.get(
              serverlessFunctionEntity.id,
            ) || [],
          cronTriggers:
            cronTriggersByServerlessFunctionId.get(
              serverlessFunctionEntity.id,
            ) || [],
          databaseEventTriggers:
            databaseEventTriggersByServerlessFunctionId.get(
              serverlessFunctionEntity.id,
            ) || [],
        } as ServerlessFunctionEntity);

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatServerlessFunction,
        flatEntityMapsToMutate: flatServerlessFunctionMaps,
      });
    }

    return flatServerlessFunctionMaps;
  }
}
