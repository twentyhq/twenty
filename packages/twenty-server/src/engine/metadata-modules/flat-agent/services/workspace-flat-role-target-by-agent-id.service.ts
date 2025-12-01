import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { NonNullableRequired } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { FlatRoleTargetByAgentIdMaps } from 'src/engine/metadata-modules/flat-agent/types/flat-role-target-by-agent-id-maps.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { MetadataToFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/types/metadata-to-flat-entity-maps-key';
import { FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { WorkspaceFlatMapCache } from 'src/engine/workspace-flat-map-cache/decorators/workspace-flat-map-cache.decorator';
import { WorkspaceFlatMapCacheService } from 'src/engine/workspace-flat-map-cache/services/workspace-flat-map-cache.service';

@Injectable()
@WorkspaceFlatMapCache(
  'flatRoleTargetByAgentIdMaps' as MetadataToFlatEntityMapsKey<AllMetadataName>,
) // TODO prastoin introduce SyncableMetadata notion
export class WorkspaceFlatRoleTargetByAgentIdService extends WorkspaceFlatMapCacheService<FlatRoleTargetByAgentIdMaps> {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineWorkspace)
    cacheStorageService: CacheStorageService,
    private readonly workspaceManyOrAllFlatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {
    super(cacheStorageService);
  }

  protected async computeFlatMap({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<FlatRoleTargetByAgentIdMaps> {
    const { flatRoleTargetMaps } =
      await this.workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRoleTargetMaps'],
        },
      );

    const agentRelatedRoleTargets = Object.values(
      flatRoleTargetMaps.byId,
    ).filter(
      (
        flatRoleTarget,
      ): flatRoleTarget is Omit<FlatRoleTarget, 'agentId'> &
        NonNullableRequired<Pick<FlatRoleTarget, 'agentId'>> =>
        isDefined(flatRoleTarget) && isDefined(flatRoleTarget.agentId),
    );

    const flatRoleTargetByAgentIdMaps: FlatRoleTargetByAgentIdMaps = {};

    for (const flatRoleTarget of agentRelatedRoleTargets) {
      flatRoleTargetByAgentIdMaps[flatRoleTarget.agentId] = flatRoleTarget;
    }

    return flatRoleTargetByAgentIdMaps;
  }
}
