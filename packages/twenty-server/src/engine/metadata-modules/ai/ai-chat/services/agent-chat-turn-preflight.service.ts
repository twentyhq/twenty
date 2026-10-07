import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { AgentChatTurnPlanService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-plan.service';
import { type AgentChatPrincipalType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-principal-type.type';
import { buildAgentChatTurnRefusalException } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-turn-refusal-exception.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentChatTurnPreflightService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly threadService: AgentChatThreadService,
    private readonly agentChatTurnPlanService: AgentChatTurnPlanService,
  ) {}

  async assertCanStartChatTurn({
    threadId,
    modelId,
    userWorkspaceId,
    workspaceMemberId,
    workspace,
    principalType,
  }: {
    threadId: string;
    modelId?: string;
    userWorkspaceId: string;
    workspaceMemberId: string;
    workspace: WorkspaceEntity;
    principalType: AgentChatPrincipalType;
  }) {
    if (this.aiModelRegistryService.getAvailableModels().length === 0) {
      throw new AiException(
        'No AI models are available. Configure at least one AI provider.',
        AiExceptionCode.API_KEY_NOT_CONFIGURED,
      );
    }

    const turnPlan = await this.agentChatTurnPlanService.planTurn({
      workspace,
      requestedModelId: modelId,
      userWorkspaceId,
      principalType,
    });

    const thread = await this.threadService.getWritableThread({
      threadId,
      workspaceMemberId,
      workspaceId: workspace.id,
    });

    if (isDefined(turnPlan.refusal)) {
      throw buildAgentChatTurnRefusalException({
        operationType: turnPlan.operationType,
        refusal: turnPlan.refusal,
        workspaceId: workspace.id,
      });
    }

    return { thread, turnPlan };
  }
}
