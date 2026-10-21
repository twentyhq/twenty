import { Injectable } from '@nestjs/common';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatTurnPreflightService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly threadService: AgentChatThreadService,
    private readonly aiBillingService: AiBillingService,
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
    workspace: WorkspaceEntity;
  }) {
    this.assertModelAvailable({ modelId, workspace });

    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId: workspace.id,
    });

    await this.assertAiExecutionAllowed({ userWorkspaceId, workspace });

    return thread;
  }

  async assertCanRunAgentTurn({
    modelId,
    userWorkspaceId,
    workspace,
  }: {
    modelId?: string;
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
  }): Promise<void> {
    this.assertModelAvailable({ modelId, workspace });

    await this.assertAiExecutionAllowed({ userWorkspaceId, workspace });
  }

  private assertModelAvailable({
    modelId,
    workspace,
  }: {
    modelId?: string;
    workspace: WorkspaceEntity;
  }): void {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    this.aiModelRegistryService.validateModelAvailability(
      getChatModelId({ requestedModelId: modelId, workspace }),
    );
  }

  private async assertAiExecutionAllowed({
    userWorkspaceId,
    workspace,
  }: {
    userWorkspaceId: string;
    workspace: WorkspaceEntity;
  }): Promise<void> {
    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId: workspace.id,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });
  }
}
