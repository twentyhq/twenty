import { Injectable } from '@nestjs/common';

import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceNotFoundDefaultError } from 'src/engine/core-modules/workspace/workspace.exception';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import { WorkspaceAiDataPolicyService } from 'src/engine/metadata-modules/ai/ai-models/services/workspace-ai-data-policy.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

type AgentChatTurnWorkspace = Pick<
  WorkspaceEntity,
  'id' | 'aiChatModelTier' | 'aiDataPolicy'
>;

@Injectable()
export class AgentChatTurnPreflightService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly threadService: AgentChatThreadService,
    private readonly aiBillingService: AiBillingService,
    private readonly workspaceAiDataPolicyService: WorkspaceAiDataPolicyService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
  ) {}

  async assertCanStartChatTurn({
    threadId,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
  }: {
    threadId: string;
    modelId?: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: AgentChatTurnWorkspace;
  }) {
    await this.assertModelAvailable({ modelId, workspace });

    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId: workspace.id,
    });

    await this.assertAiExecutionAllowed({ userWorkspaceId, workspace });

    return thread;
  }

  async getWorkspaceReadyForAgentTurnOrThrow({
    workspaceId,
    modelId,
    userWorkspaceId,
  }: {
    workspaceId: string;
    modelId?: string;
    userWorkspaceId: string;
  }): Promise<FlatWorkspace> {
    const workspace = await this.coreEntityCacheService.get(
      'workspaceEntity',
      workspaceId,
    );

    assertIsDefinedOrThrow(workspace, WorkspaceNotFoundDefaultError);

    await this.assertModelAvailable({ modelId, workspace });

    await this.assertAiExecutionAllowed({ userWorkspaceId, workspace });

    return workspace;
  }

  private async assertModelAvailable({
    modelId,
    workspace,
  }: {
    modelId?: string;
    workspace: AgentChatTurnWorkspace;
  }): Promise<void> {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    this.aiModelRegistryService.validateModelAvailabilityOrThrow({
      modelId: getChatModelId({ requestedModelId: modelId, workspace }),
      aiDataPolicy:
        await this.workspaceAiDataPolicyService.getEffectiveAiDataPolicy(
          workspace,
        ),
    });
  }

  private async assertAiExecutionAllowed({
    userWorkspaceId,
    workspace,
  }: {
    userWorkspaceId: string;
    workspace: AgentChatTurnWorkspace;
  }): Promise<void> {
    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });
  }
}
