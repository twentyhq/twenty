import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceAiPrivacySettings } from 'src/engine/metadata-modules/ai/ai-models/types/workspace-ai-privacy-settings.type';

@Injectable()
export class WorkspaceAiDataPolicyService {
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  // throws rather than defaulting, since a missing policy would read as "no restriction"
  async getAiPrivacySettingsOrThrow(
    workspaceId: string,
  ): Promise<WorkspaceAiPrivacySettings> {
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
      isProductImprovementDataSharingEnabled:
        workspace.isProductImprovementDataSharingEnabled,
    };
  }
}
