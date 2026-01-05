import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getMetadataEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-entity-relation-properties.util';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { WorkspaceCache } from 'src/engine/workspace-cache/decorators/workspace-cache.decorator';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

@Injectable()
@WorkspaceCache('flatRouteTriggerMaps')
export class WorkspaceFlatRouteTriggerMapCacheService extends WorkspaceCacheProvider<
  FlatEntityMaps<FlatRouteTrigger>
> {
  constructor(
    @InjectRepository(RouteTriggerEntity)
    private readonly routeTriggerRepository: Repository<RouteTriggerEntity>,
  ) {
    super();
  }

  async computeForCache(
    workspaceId: string,
  ): Promise<FlatEntityMaps<FlatRouteTrigger>> {
    const routeTriggers = await this.routeTriggerRepository.find({
      where: {
        workspaceId,
      },
    });

    const flatRouteTriggerMaps = createEmptyFlatEntityMaps();

    for (const routeTriggerEntity of routeTriggers) {
      const routeTriggerEntityWithoutRelations = removePropertiesFromRecord(
        routeTriggerEntity,
        getMetadataEntityRelationProperties('routeTrigger'),
      );
      const flatRouteTrigger = {
        ...routeTriggerEntityWithoutRelations,
        createdAt: routeTriggerEntity.createdAt.toISOString(),
        updatedAt: routeTriggerEntity.updatedAt.toISOString(),
        universalIdentifier:
          routeTriggerEntity.universalIdentifier ?? routeTriggerEntity.id,
      } satisfies FlatRouteTrigger;

      addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
        flatEntity: flatRouteTrigger,
        flatEntityMapsToMutate: flatRouteTriggerMaps,
      });
    }

    return flatRouteTriggerMaps;
  }
}
