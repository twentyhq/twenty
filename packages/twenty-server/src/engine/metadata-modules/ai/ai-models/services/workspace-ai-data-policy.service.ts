import { Injectable } from '@nestjs/common';

import {
  isAiContentRecordingAllowed,
  type AiDataPolicy,
} from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { NO_AI_DATA_POLICY } from 'src/engine/metadata-modules/ai/ai-models/constants/no-ai-data-policy.constant';

type AiDataPolicyWorkspace = Pick<WorkspaceEntity, 'id' | 'aiDataPolicy'>;

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

  async getEffectiveAiDataPolicy(
    workspace: AiDataPolicyWorkspace,
  ): Promise<AiDataPolicy> {
    return (await this.findStoredAiDataPolicy(workspace)) ?? NO_AI_DATA_POLICY;
  }

  async findStoredAiDataPolicy(
    workspace: AiDataPolicyWorkspace,
  ): Promise<AiDataPolicy | null> {
    const isAiDataPolicyEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_AI_DATA_POLICY_ENABLED,
        workspace.id,
      );

    return isAiDataPolicyEnabled && isDefined(workspace.aiDataPolicy)
      ? { ...NO_AI_DATA_POLICY, ...workspace.aiDataPolicy }
      : null;
  }

  async isContentRecordingAllowedOrThrow(
    workspaceId: string,
  ): Promise<boolean> {
    return this.isContentRecordingAllowed(
      await this.getWorkspaceOrThrow(workspaceId),
    );
  }

  async isContentRecordingAllowed(
    workspace: AiDataPolicyWorkspace,
  ): Promise<boolean> {
    return isAiContentRecordingAllowed(
      await this.getEffectiveAiDataPolicy(workspace),
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
