import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDerivedCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-derived-cache-provider.service';

import { WorkspaceDerivedCache } from 'src/engine/workspace-cache/decorators/workspace-derived-cache.decorator';
import { type WorkspaceCacheDataMap } from 'src/engine/workspace-cache/types/workspace-cache-key.type';

@Injectable()
@WorkspaceDerivedCache('webhookRoleMap')
export class WorkspaceWebhookRoleMapCacheService extends WorkspaceDerivedCacheProvider<
  'webhookRoleMap',
  'flatRoleTargetMaps'
> {
  readonly sourceKeyName = 'flatRoleTargetMaps';

  protected computeFromSource(
    flatRoleTargetMaps: WorkspaceCacheDataMap['flatRoleTargetMaps'],
  ): Record<string, string> {
    const webhookRoleMap: Record<string, string> = {};

    for (const flatRoleTarget of Object.values(
      flatRoleTargetMaps.byUniversalIdentifier,
    )) {
      if (isDefined(flatRoleTarget?.webhookId)) {
        webhookRoleMap[flatRoleTarget.webhookId] = flatRoleTarget.roleId;
      }
    }

    return webhookRoleMap;
  }
}
