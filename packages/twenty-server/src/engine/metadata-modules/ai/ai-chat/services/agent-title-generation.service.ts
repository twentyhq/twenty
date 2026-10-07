import { Injectable, Logger } from '@nestjs/common';

import {
  type LanguageModelUsage,
  type StepResult,
  type ToolSet,
  generateText,
} from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { AgentChatTurnPlanService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-turn-plan.service';
import { type AgentChatPrincipalType } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-principal-type.type';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { buildReasoningProviderOptions } from 'src/engine/metadata-modules/ai/ai-models/utils/build-reasoning-provider-options.util';

@Injectable()
export class AgentTitleGenerationService {
  private readonly logger = new Logger(AgentTitleGenerationService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly agentChatTurnPlanService: AgentChatTurnPlanService,
  ) {}

  async generateThreadTitle({
    messageContent,
    workspaceId,
    userWorkspaceId,
    principalType,
  }: {
    messageContent: string;
    workspaceId: string;
    userWorkspaceId: string | null;
    principalType: AgentChatPrincipalType;
  }): Promise<string> {
    // Titles run on the fast default, which is the included model for an entitled workspace
    const includedModel =
      await this.agentChatTurnPlanService.findIncludedChatModel({
        workspaceId,
        principalType,
      });
    const operationType = isDefined(includedModel)
      ? UsageOperationType.AI_CHAT_INCLUDED
      : UsageOperationType.AI_CHAT_TOKEN;

    if (isDefined(includedModel)) {
      const includedRefusal =
        await this.agentChatTurnPlanService.findChatRefusal({
          workspaceId,
          operationType,
          userWorkspaceId,
        });

      if (isDefined(includedRefusal)) {
        return this.generateFallbackTitle(messageContent);
      }
    } else {
      await this.aiBillingService.assertAiExecutionAllowed({
        workspaceId,
        operationType,
        spenders: { userWorkspaceId },
      });
    }

    const defaultModel =
      includedModel ??
      this.aiModelRegistryService.getDefaultModelForTier('fast');

    if (!defaultModel) {
      this.logger.warn('No default AI model available for title generation');

      return this.generateFallbackTitle(messageContent);
    }

    let usage: LanguageModelUsage | undefined;
    let steps: StepResult<ToolSet>[] | undefined;

    try {
      const result = await generateText({
        model: defaultModel.model,
        providerOptions: buildReasoningProviderOptions(defaultModel),
        prompt: `Generate a concise, descriptive title (maximum 60 characters) for a chat thread based on the following message. The title should capture the main topic or purpose of the conversation. Return only the title, nothing else. Message: "${messageContent}"`,
        ...buildAiTelemetry({
          functionId: 'agent-title-generation',
          workspaceId,
          userWorkspaceId,
        }),
      });

      usage = result.usage;
      steps = result.steps;

      return this.cleanTitle(result.text);
    } catch (error) {
      this.logger.error('Failed to generate title with AI:', error);

      return this.generateFallbackTitle(messageContent);
    } finally {
      if (usage) {
        const cacheCreationTokens = steps
          ? extractCacheCreationTokensFromSteps(steps)
          : 0;

        void this.aiBillingService.calculateAndBillUsage(
          defaultModel.modelId,
          { usage, cacheCreationTokens },
          workspaceId,
          operationType,
          null,
          userWorkspaceId,
        );
      }
    }
  }

  private generateFallbackTitle(messageContent: string): string {
    const cleanContent = messageContent.trim().replace(/\s+/g, ' ');
    const title = cleanContent.substring(0, 50);

    return cleanContent.length > 50 ? `${title}...` : title;
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/^["']|["']$/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }
}
