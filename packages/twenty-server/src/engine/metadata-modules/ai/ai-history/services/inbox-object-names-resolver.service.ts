import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { INBOX_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/inbox-object-names.constant';
import { LEGACY_INBOX_OBJECT_NAMES } from 'src/engine/metadata-modules/ai/ai-history/constants/legacy-inbox-object-names.constant';
import { type InboxObjectNames } from 'src/engine/metadata-modules/ai/ai-history/types/inbox-object-names.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class InboxObjectNamesResolverService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async resolve(workspaceId: string): Promise<InboxObjectNames> {
    const { featureFlagsMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['featureFlagsMap'],
    );

    return featureFlagsMap[FeatureFlagKey.IS_INBOX_OBJECT_NAMING_ENABLED]
      ? INBOX_OBJECT_NAMES
      : LEGACY_INBOX_OBJECT_NAMES;
  }
}
