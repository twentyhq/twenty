import { Injectable } from '@nestjs/common';

import { isAiDataPolicyActive, type AiDataPolicy } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

@Injectable()
export class WorkspaceAiDataPolicyService {
  constructor(
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async getAiDataPolicyOrThrow(workspaceId: string): Promise<AiDataPolicy> {
    return this.getEffectiveAiDataPolicy(
      await this.getWorkspaceOrThrow(workspaceId),
    );
  }

  async getEffectiveAiDataPolicy(workspace: {
    id: string;
    aiDataPolicy?: AiDataPolicy;
  }): Promise<AiDataPolicy> {
    const isAiDataPolicyEnabled = await this.isAiDataPolicyEnabled(
      workspace.id,
    );

    return isAiDataPolicyEnabled
      ? (workspace.aiDataPolicy ?? NO_AI_DATA_POLICY)
      : NO_AI_DATA_POLICY;
  }

  async isContentRecordingAllowedOrThrow(
    workspaceId: string,
  ): Promise<boolean> {
    return this.isContentRecordingAllowed(
      await this.getWorkspaceOrThrow(workspaceId),
    );
  }

  async isContentRecordingAllowed(workspace: {
    id: string;
    aiDataPolicy?: AiDataPolicy;
    isProductImprovementDataSharingEnabled?: boolean;
  }): Promise<boolean> {
    if (!(await this.isAiDataPolicyEnabled(workspace.id))) {
      return true;
    }

    return (
      !isAiDataPolicyActive(workspace.aiDataPolicy ?? NO_AI_DATA_POLICY) &&
      (workspace.isProductImprovementDataSharingEnabled ?? true)
    );
  }

  private isAiDataPolicyEnabled(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_DATA_POLICY_ENABLED,
      workspaceId,
    );
  }

  private async getWorkspaceOrThrow(workspaceId: string) {
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

    return workspace;
  }
}
