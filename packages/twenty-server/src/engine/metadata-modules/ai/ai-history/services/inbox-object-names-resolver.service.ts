import { Injectable } from '@nestjs/common';

import { type InboxObjectNames } from 'src/engine/metadata-modules/ai/ai-history/types/inbox-object-names.type';
import { getInboxObjectNames } from 'src/engine/metadata-modules/ai/ai-history/utils/get-inbox-object-names.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class InboxObjectNamesResolverService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async resolve(workspaceId: string): Promise<InboxObjectNames> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return getInboxObjectNames(featureFlagsMap);
  }
}
