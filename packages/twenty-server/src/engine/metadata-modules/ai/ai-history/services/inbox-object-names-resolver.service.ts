import { Injectable } from '@nestjs/common';

import { type InboxObjectNamesByLegacyName } from 'src/engine/metadata-modules/ai/ai-history/types/inbox-object-names-by-legacy-name.type';
import { getInboxObjectNamesByLegacyName } from 'src/engine/metadata-modules/ai/ai-history/utils/get-inbox-object-names-by-legacy-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class InboxObjectNamesResolverService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async resolve(workspaceId: string): Promise<InboxObjectNamesByLegacyName> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return getInboxObjectNamesByLegacyName(featureFlagsMap);
  }
}
