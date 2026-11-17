import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { type FlatRoleTargetByApplicationIdMaps } from 'src/engine/metadata-modules/role-target/types/flat-role-target-by-application-id-maps.type';
import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('flatRoleTargetByApplicationIdMaps')
export class WorkspaceFlatRoleTargetByApplicationIdMapCacheService extends WorkspaceDerivedCacheProvider<
  'flatRoleTargetByApplicationIdMaps',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyName = 'flatRoleTargetMaps';

  protected computeFromSource(
    flatRoleTargetMaps: WorkspaceCacheDataMap['flatRoleTargetMaps'],
  ): FlatRoleTargetByApplicationIdMaps {
    const flatRoleTargetByApplicationIdMaps: FlatRoleTargetByApplicationIdMaps =
      {};

    for (const flatRoleTarget of Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    )) {
      if (isDefined(flatRoleTarget?.targetApplicationId)) {
        flatRoleTargetByApplicationIdMaps[flatRoleTarget.targetApplicationId] =
          flatRoleTarget;
      }
    }

    return flatRoleTargetByApplicationIdMaps;
  }
}
