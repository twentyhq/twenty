import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { generateText } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import {
  buildCompactionPrompt,
  COMPACTION_SYSTEM_PROMPT,
} from 'src/engine/metadata-modules/ai/ai-chat/constants/compaction-prompts.const';
import { AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentChatThreadCompactionSummary } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-compaction-summary.type';
import { applyCompactionSummary } from 'src/engine/metadata-modules/ai/ai-chat/utils/apply-compaction-summary.util';
import {
  buildCompactionSummaryMessage,
  isCompactionSummaryMessage,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/build-compaction-summary-message.util';
import { buildCompactionTranscript } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-compaction-transcript.util';
import { getCompactionThresholdTokens } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-compaction-threshold-tokens.util';
import { splitMessagesForCompaction } from 'src/engine/metadata-modules/ai/ai-chat/utils/split-messages-for-compaction.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const COMPACTION_SUMMARY_MAX_OUTPUT_TOKENS = 4_096;

export type CompactionInput = {
  messages: ExtendedUIMessage[];
  threadId: string | undefined;
  workspaceId: string;
  userWorkspaceId: string;
  contextWindowTokens: number;
  conversationSizeTokens: number;
  threadModel: RegisteredAiModel;
};

export type CompactionResult = {
  messages: ExtendedUIMessage[];
  wasCompacted: boolean;
};

@Injectable()
export class MessageCompactionService {
  private readonly logger = new Logger(MessageCompactionService.name);

  constructor(
    @InjectWorkspaceScopedRepository(AgentChatThreadEntity)
    private readonly threadRepository: WorkspaceScopedRepository<AgentChatThreadEntity>,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiBillingService: AiBillingService,
  ) {}

  async compactIfOverBudget({
    messages,
    threadId,
    workspaceId,
    userWorkspaceId,
    contextWindowTokens,
    conversationSizeTokens,
    threadModel,
  }: CompactionInput): Promise<CompactionResult> {
    if (!isDefined(threadId)) {
      return { messages, wasCompacted: false };
    }

    const previousSummary = await this.loadCompactionSummary(
      threadId,
      workspaceId,
    );

    const { messages: currentMessages } = applyCompactionSummary(
      messages,
      previousSummary,
      threadId,
    );

    const thresholdTokens = getCompactionThresholdTokens(contextWindowTokens);

    if (conversationSizeTokens <= thresholdTokens) {
      return { messages: currentMessages, wasCompacted: false };
    }

    const { messagesToCompact, messagesToKeep } =
      splitMessagesForCompaction(currentMessages);

    const newMessagesToSummarize = messagesToCompact.filter(
      (message) => !isCompactionSummaryMessage(message),
    );

    if (newMessagesToSummarize.length === 0) {
      return { messages: currentMessages, wasCompacted: false };
    }

    this.logger.log(
      `Conversation size ${conversationSizeTokens} exceeds compaction threshold ${Math.round(thresholdTokens)} for thread ${threadId}. Summarizing ${newMessagesToSummarize.length} messages.`,
    );

    let summaryText: string;

    try {
      summaryText = await this.generateSummary({
        previousSummaryText: previousSummary?.text ?? null,
        transcript: buildCompactionTranscript(newMessagesToSummarize),
        workspaceId,
        userWorkspaceId,
        threadModel,
      });
    } catch (error) {
      this.logger.warn(
        `Compaction summarization failed for thread ${threadId}, falling back to pruning: ${error instanceof Error ? error.message : String(error)}`,
      );

      return { messages: currentMessages, wasCompacted: false };
    }

    const lastCompactedMessage =
      newMessagesToSummarize[newMessagesToSummarize.length - 1];

    await this.persistCompactionSummary(threadId, workspaceId, {
      text: summaryText,
      lastCompactedMessageId: lastCompactedMessage.id,
      compactedAt: new Date().toISOString(),
    });

    return {
      messages: [
        buildCompactionSummaryMessage(threadId, summaryText),
        ...messagesToKeep,
      ],
      wasCompacted: true,
    };
  }

  private async loadCompactionSummary(
    threadId: string,
    workspaceId: string,
  ): Promise<AgentChatThreadCompactionSummary | null> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
      select: ['id', 'compactionSummary'],
    });

    return thread?.compactionSummary ?? null;
  }

  private async persistCompactionSummary(
    threadId: string,
    workspaceId: string,
    compactionSummary: AgentChatThreadCompactionSummary,
  ): Promise<void> {
    try {
      await this.threadRepository.update(
        workspaceId,
        { id: threadId },
        { compactionSummary },
      );
    } catch (error) {
      // The in-flight request still uses the summary; the next turn simply
      // re-summarizes instead of updating the anchor.
      this.logger.warn(
        `Failed to persist compaction summary for thread ${threadId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private async generateSummary({
    previousSummaryText,
    transcript,
    workspaceId,
    userWorkspaceId,
    threadModel,
  }: {
    previousSummaryText: string | null;
    transcript: string;
    workspaceId: string;
    userWorkspaceId: string;
    threadModel: RegisteredAiModel;
  }): Promise<string> {
    const summarizerModel = this.resolveSummarizerModel(threadModel);

    const result = await generateText({
      model: summarizerModel.model,
      system: COMPACTION_SYSTEM_PROMPT,
      prompt: buildCompactionPrompt({
        previousSummary: previousSummaryText,
        transcript,
      }),
      maxOutputTokens: COMPACTION_SUMMARY_MAX_OUTPUT_TOKENS,
      experimental_telemetry: AI_TELEMETRY_CONFIG,
    });

    void this.aiBillingService.calculateAndBillUsage(
      summarizerModel.modelId,
      {
        usage: result.usage,
        cacheCreationTokens: extractCacheCreationTokensFromSteps(result.steps),
      },
      workspaceId,
      UsageOperationType.AI_CHAT_TOKEN,
      null,
      userWorkspaceId,
    );

    if (!isNonEmptyString(result.text.trim())) {
      throw new Error('Summarizer returned an empty summary');
    }

    return result.text.trim();
  }

  private resolveSummarizerModel(
    threadModel: RegisteredAiModel,
  ): RegisteredAiModel {
    try {
      return this.aiModelRegistryService.getDefaultSpeedModel();
    } catch {
      return threadModel;
    }
  }
}
