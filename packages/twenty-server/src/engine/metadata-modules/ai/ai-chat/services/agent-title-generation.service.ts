import { Injectable, Logger } from '@nestjs/common';

import {
  type LanguageModelUsage,
  type StepResult,
  type ToolSet,
  generateText,
} from 'ai';

import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class AgentTitleGenerationService {
  private readonly logger = new Logger(AgentTitleGenerationService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly billingUsageService: BillingUsageService,
  ) {}

  async generateThreadTitle(
    messageContent: string,
    workspaceId: string,
    userWorkspaceId: string | null,
  ): Promise<string> {
    await this.billingUsageService.hasAvailableCreditsOrThrow(workspaceId);

    const defaultModel = this.aiModelRegistryService.getDefaultSpeedModel();

    if (!defaultModel) {
      this.logger.warn('No default AI model available for title generation');

      return this.generateFallbackTitle(messageContent);
    }

    let usage: LanguageModelUsage | undefined;
    let steps: StepResult<ToolSet>[] | undefined;

    try {
      const result = await generateText({
        model: defaultModel.model,
        prompt: `Generate a concise, descriptive title (maximum 60 characters) for a chat thread based on the following message. The title should capture the main topic or purpose of the conversation. Return only the title, nothing else. Message: "${messageContent}"`,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
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

        this.aiBillingService.calculateAndBillUsage(
          defaultModel.modelId,
          { usage, cacheCreationTokens },
          workspaceId,
          UsageOperationType.AI_CHAT_TOKEN,
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
