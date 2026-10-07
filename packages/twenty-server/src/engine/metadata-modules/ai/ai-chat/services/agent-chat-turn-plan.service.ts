import { Injectable } from '@nestjs/common';

import { isIncludedAiModelVariant } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentChatPrincipalType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-principal-type.type';
import {
  type AgentChatOperationType,
  type AgentChatTurnPlan,
} from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-plan.type';
import { selectAgentChatTurnModel } from 'src/engine/metadata-modules/ai/ai-chat/utils/select-agent-chat-turn-model.util';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { getChatModelId } from 'src/engine/metadata-modules/ai/ai-models/utils/get-chat-model-id.util';

@Injectable()
export class AgentChatTurnPlanService {
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly billingService: BillingService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  async planTurn({
    workspace,
    requestedModelId,
    userWorkspaceId,
    principalType,
  }: {
    workspace: WorkspaceEntity;
    requestedModelId: string | undefined;
    userWorkspaceId: string;
    principalType: AgentChatPrincipalType;
  }): Promise<AgentChatTurnPlan> {
    const includedModel = await this.findIncludedChatModel({
      workspaceId: workspace.id,
      principalType,
    });

    return this.planTurnWithIncludedModel({
      workspace,
      requestedModelId,
      userWorkspaceId,
      includedModel,
    });
  }

  // For callers that already read the included model through findIncludedChatModel, so the entitlement is read once
  async planTurnWithIncludedModel({
    workspace,
    requestedModelId,
    userWorkspaceId,
    includedModel,
  }: {
    workspace: WorkspaceEntity;
    requestedModelId: string | undefined;
    userWorkspaceId: string;
    includedModel: RegisteredAiModel | null;
  }): Promise<AgentChatTurnPlan> {
    const chatModelId = getChatModelId({ requestedModelId, workspace });

    this.aiModelRegistryService.validateModelAvailability(chatModelId);

    const requestedModel = this.aiModelRegistryService.resolveModelForAgent(
      { modelId: chatModelId },
      workspace,
    );

    const isRequestedModelIncluded =
      isDefined(includedModel) &&
      isIncludedAiModelVariant({
        modelId: requestedModel.modelId,
        includedModelId: includedModel.modelId,
      });

    // An included variant is never billed, so its turn cannot depend on the allowance
    const paidRefusal = isRequestedModelIncluded
      ? null
      : await this.findChatRefusal({
          workspaceId: workspace.id,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          userWorkspaceId,
        });

    const { registeredModel, operationType } = selectAgentChatTurnModel({
      requestedModel,
      includedModel,
      isFollowingWorkspaceTier: !isDefined(requestedModelId),
      isAllowanceExhausted:
        paidRefusal?.kind === 'quotaExhausted' &&
        paidRefusal.exhaustedScope.exhaustedKind === 'allowance',
    });

    const refusal =
      operationType === UsageOperationType.AI_CHAT_INCLUDED
        ? await this.findChatRefusal({
            workspaceId: workspace.id,
            operationType,
            userWorkspaceId,
          })
        : paidRefusal;

    return { registeredModel, operationType, refusal };
  }

  async findIncludedChatModel({
    workspaceId,
    principalType,
  }: {
    workspaceId: string;
    principalType: AgentChatPrincipalType;
  }): Promise<RegisteredAiModel | null> {
    // An application or OAuth client could otherwise use member chat as a free model endpoint
    if (principalType !== 'userSession') {
      return null;
    }

    const hasIncludedFastModelEntitlement =
      await this.billingService.hasIncludedFastModelEntitlement(workspaceId);

    return hasIncludedFastModelEntitlement
      ? this.aiModelRegistryService.findIncludedChatModel()
      : null;
  }

  async findChatRefusal({
    workspaceId,
    operationType,
    userWorkspaceId,
  }: {
    workspaceId: string;
    operationType: AgentChatOperationType;
    userWorkspaceId: string | null;
  }): Promise<UsageRefusal | null> {
    return this.billingUsageService.findUsageRefusal({
      workspaceId,
      resourceType: UsageResourceType.AI,
      operationType,
      spenders: { userWorkspaceId },
    });
  }
}
