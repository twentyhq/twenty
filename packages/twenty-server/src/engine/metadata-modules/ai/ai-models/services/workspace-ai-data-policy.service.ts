import { Injectable } from '@nestjs/common';

import { type AiDataPolicy } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class WorkspaceAiDataPolicyService {
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  // throws rather than defaulting, since a missing policy would read as "no restriction"
  async getAiDataPolicyOrThrow(workspaceId: string): Promise<AiDataPolicy> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    if (!isDefined(workspace)) {
      throw new AiException(
        `Workspace ${workspaceId} not found`,
        AiExceptionCode.WORKSPACE_NOT_FOUND,
      );
    }

    return {
      aiDataResidency: workspace.aiDataResidency,
      isAiZeroDataRetentionRequired: workspace.isAiZeroDataRetentionRequired,
    };
  }
}
