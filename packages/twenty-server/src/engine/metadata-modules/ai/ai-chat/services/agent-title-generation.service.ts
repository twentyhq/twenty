import { Injectable, Logger } from '@nestjs/common';

import { generateText } from 'ai';

import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';

@Injectable()
export class AgentTitleGenerationService {
  private readonly logger = new Logger(AgentTitleGenerationService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly billingService: BillingService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateThreadTitle(
    messageContent: string,
    workspaceId: string,
  ): Promise<string> {
    if (this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      const canBill = await this.billingService.canBillMeteredProduct(
        workspaceId,
        BillingProductKey.WORKFLOW_NODE_EXECUTION,
      );

      if (!canBill) {
        throw new BillingException(
          'Credits exhausted',
          BillingExceptionCode.BILLING_CREDITS_EXHAUSTED,
        );
      }
    }

    try {
      const defaultModel = this.aiModelRegistryService.getDefaultSpeedModel();

      if (!defaultModel) {
        this.logger.warn('No default AI model available for title generation');

        return this.generateFallbackTitle(messageContent);
      }

      const result = await generateText({
        model: defaultModel.model,
        prompt: `Generate a concise, descriptive title (maximum 60 characters) for a chat thread based on the following message. The title should capture the main topic or purpose of the conversation. Return only the title, nothing else. Message: "${messageContent}"`,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      return this.cleanTitle(result.text);
    } catch (error) {
      this.logger.error('Failed to generate title with AI:', error);

      return this.generateFallbackTitle(messageContent);
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
