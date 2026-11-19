import { Injectable, Logger } from '@nestjs/common';

import { type LanguageModelUsage, Output, generateText } from 'ai';
import { z } from 'zod';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AGENT_CHAT_THREAD_ICON_COLORS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-icon-colors.constant';
import { AGENT_CHAT_THREAD_ICON_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-icon-names.constant';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { WorkspaceAiDataPolicyService } from 'src/engine/metadata-modules/ai/ai-models/services/workspace-ai-data-policy.service';
import { buildReasoningProviderOptions } from 'src/engine/metadata-modules/ai/ai-models/utils/build-reasoning-provider-options.util';

const TITLE_AND_ICON_SCHEMA = z.object({
  title: z.string(),
  icon: z.enum(AGENT_CHAT_THREAD_ICON_NAMES),
  iconColor: z.enum(AGENT_CHAT_THREAD_ICON_COLORS),
});

type GeneratedThreadTitle = {
  title: string;
  icon: z.infer<typeof TITLE_AND_ICON_SCHEMA>['icon'] | null;
  iconColor: z.infer<typeof TITLE_AND_ICON_SCHEMA>['iconColor'] | null;
};

@Injectable()
export class AgentTitleGenerationService {
  private readonly logger = new Logger(AgentTitleGenerationService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
    private readonly workspaceAiDataPolicyService: WorkspaceAiDataPolicyService,
  ) {}

  async generateThreadTitle({
    messageContent,
    workspaceId,
    userWorkspaceId,
    shouldPickIcon,
  }: {
    messageContent: string;
    workspaceId: string;
    userWorkspaceId: string | null;
    shouldPickIcon: boolean;
  }): Promise<GeneratedThreadTitle> {
    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: { userWorkspaceId },
    });

    const aiDataPolicy =
      await this.workspaceAiDataPolicyService.getAiDataPolicyOrThrow(
        workspaceId,
      );

    const isContentRecordingAllowed =
      await this.workspaceAiDataPolicyService.isContentRecordingAllowedOrThrow(
        workspaceId,
      );

    const defaultModel = this.aiModelRegistryService.findDefaultModelForTier({
      tier: 'fast',
      aiDataPolicy,
    });

    if (!defaultModel) {
      this.logger.warn('No default AI model available for title generation');

      return {
        title: this.generateFallbackTitle(messageContent),
        icon: null,
        iconColor: null,
      };
    }

    let usage: LanguageModelUsage | undefined;

    const titleInstruction = `Generate a concise, descriptive title (maximum 60 characters) for a chat thread based on the following message. The title should capture the main topic or purpose of the conversation.`;
    const generationArgs = {
      model: defaultModel.model,
      providerOptions: buildReasoningProviderOptions(defaultModel),
      ...buildAiTelemetry({
        functionId: 'agent-title-generation',
        isContentRecordingAllowed,
        workspaceId,
        userWorkspaceId,
      }),
    };

    try {
      if (shouldPickIcon) {
        const result = await generateText({
          ...generationArgs,
          output: Output.object({ schema: TITLE_AND_ICON_SCHEMA }),
          prompt: `${titleInstruction} Also pick the icon that best represents the topic, and the colour that best fits it. Message: "${messageContent}"`,
        });

        usage = result.usage;

        return {
          title: this.cleanTitle(result.output.title),
          icon: result.output.icon,
          iconColor: result.output.iconColor,
        };
      }

      const result = await generateText({
        ...generationArgs,
        prompt: `${titleInstruction} Return only the title, nothing else. Message: "${messageContent}"`,
      });

      usage = result.usage;

      return {
        title: this.cleanTitle(result.text),
        icon: null,
        iconColor: null,
      };
    } catch (error) {
      this.logger.error('Failed to generate title with AI:', error);

      return {
        title: this.generateFallbackTitle(messageContent),
        icon: null,
        iconColor: null,
      };
    } finally {
      if (usage) {
        void this.aiBillingService.calculateAndBillUsage({
          modelId: defaultModel.modelId,
          billingInput: { usage },
          workspaceId,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          spenders: { userWorkspaceId },
        });
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
