import { Injectable, Logger } from '@nestjs/common';

import {
  createUIMessageStream,
  readUIMessageStream,
  type TextStreamPart,
  type ToolSet,
  toUIMessageStream,
  type UIMessageStreamWriter,
} from 'ai';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
  isSilentAgentChatMessageParts,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { v5 as uuidv5 } from 'uuid';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { type AgentTurn } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-turn.service';
import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';
import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';
import { addStepToAgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/add-step-to-agent-turn-usage.util';
import { FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job-name.constant';
import { type FlushQueuedAgentChatMessagesJobData } from 'src/engine/metadata-modules/ai/ai-chat/jobs/flush-queued-agent-chat-messages-job.types';
import { AGENT_CHAT_CHECKPOINT_INTERVAL_MS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-checkpoint-interval-ms.constant';
import { AgentChatCancelSubscriberService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-cancel-subscriber.service';
import { AgentChatEventPublisherService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-event-publisher.service';
import { AgentChatStreamHeartbeatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-heartbeat.service';
import {
  type AgentChatStreamClaim,
  AgentChatStreamRecoveryService,
} from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-stream-recovery.service';
import { AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { type AgentChatTurnOutcome } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-turn-outcome.type';
import {
  classifyAgentChatTurnOutcome,
  resolveSupersededTurnOutcome,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/classify-agent-chat-turn-outcome.util';
import { findAwaitingCallText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-awaiting-call-text.util';
import { hasReplyText } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-reply-text.util';
import { findLastMessageText } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-last-message-text.util';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { mapAgentChatTurnOutcomeToTurnStatus } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-agent-chat-turn-outcome-to-turn-status.util';
import { updateAgentChatThreadUsage } from 'src/engine/metadata-modules/ai/ai-chat/utils/update-agent-chat-thread-usage.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationWriterService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-writer.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// the reply id derives from the stream, so a retried job overwrites its own reply while each resume writes its own
const ASSISTANT_MESSAGE_ID_NAMESPACE = '0b9c2a3d-4e5f-4a1b-8c2d-3e4f5a6b7c8d';

export type AgentTurnStreamUsage = AgentTurnUsage & {
  conversationSize: number;
};

export type AgentTurnStreamSource = Pick<AgentTurn, 'modelConfig'> & {
  parts: ReadableStream<TextStreamPart<ToolSet>>;
  getStreamError?: () => unknown;
  // writes that must land before the stream closes, such as a generated title
  pendingWrites?: Promise<unknown>;
};

export type AgentTurnStreamResult = {
  assistantMessageId: string;
  replyParts: ExtendedUIMessagePart[];
  isAborted: boolean;
  streamError: unknown;
  usage: AgentTurnStreamUsage;
  modelConfig: AiModelConfig | null;
};

export type AgentTurnFinish = {
  outcome: AgentChatTurnOutcome;
  isAwaitingAnswer: boolean;
  // the thread as it was before this turn, absent when another stream took the thread over
  threadBefore: AgentChatThreadWorkspaceEntity | null;
};

@Injectable()
export class AgentTurnStreamService {
  private readonly logger = new Logger(AgentTurnStreamService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessage')
    private readonly messageRepository: AgentHistoryRepository<AgentMessageWorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.aiStreamQueue)
    private readonly chatMessageQueueService: MessageQueueService,
    private readonly eventPublisherService: AgentChatEventPublisherService,
    private readonly cancelSubscriberService: AgentChatCancelSubscriberService,
    private readonly streamHeartbeatService: AgentChatStreamHeartbeatService,
    private readonly streamRecoveryService: AgentChatStreamRecoveryService,
    private readonly conversationWriterService: AgentConversationWriterService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly threadService: AgentChatThreadService,
  ) {}

  // Keeps the claim alive and stoppable while the work runs, and releases it however the work ends.
  // Messages queued meanwhile are sent then, unless the member stopped the turn
  async runClaimed<TResult>({
    claim,
    jobAbortSignal,
    work,
  }: {
    claim: AgentChatStreamClaim;
    jobAbortSignal?: AbortSignal;
    work: (abortSignal: AbortSignal) => Promise<TResult>;
  }): Promise<TResult> {
    const { threadId, streamId } = claim;

    await this.eventPublisherService.resetStreamState(threadId);

    const abortController = new AbortController();
    const cancelChannel = getCancelChannel(threadId, streamId);
    const stopHeartbeat = this.streamHeartbeatService.startRunning(streamId);

    await this.cancelSubscriberService.subscribe(cancelChannel, () => {
      abortController.abort();
    });

    jobAbortSignal?.addEventListener(
      'abort',
      () => {
        abortController.abort(
          new AiException(
            'The response was interrupted before it could finish.',
            AiExceptionCode.STREAM_INTERRUPTED,
          ),
        );
      },
      { once: true },
    );

    try {
      return await work(abortController.signal);
    } catch (error) {
      await this.failStream({ claim, error });

      throw error;
    } finally {
      stopHeartbeat();
      await this.cancelSubscriberService.unsubscribe(cancelChannel);
      await this.streamRecoveryService.releaseStreamClaim(claim);

      if (!abortController.signal.aborted) {
        await this.flushQueuedMessages(claim);
      }
    }
  }

  private async flushQueuedMessages({
    workspaceId,
    threadId,
  }: AgentChatStreamClaim): Promise<void> {
    try {
      const hasQueuedMessages = await this.messageRepository.existsBy(
        workspaceId,
        { threadId, status: AgentMessageStatus.QUEUED },
      );

      if (hasQueuedMessages) {
        await this.chatMessageQueueService.add<FlushQueuedAgentChatMessagesJobData>(
          FLUSH_QUEUED_AGENT_CHAT_MESSAGES_JOB_NAME,
          { workspaceId, threadId },
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send the messages queued in thread ${threadId} of workspace ${workspaceId}: ${formatErrorWithCause(error)}`,
      );
    }
  }

  // ends the turn the claim runs as failed, and tells the conversation's subscribers
  async failStream({
    claim,
    error,
  }: {
    claim: AgentChatStreamClaim;
    error: unknown;
  }): Promise<void> {
    await this.streamRecoveryService.failStream({ ...claim, error });
  }

  // a turn that could not start throws its error; otherwise the caller gets what startTurn returned
  async stream<TStarted extends { source: AgentTurnStreamSource }>({
    claim,
    turnId,
    startTurn,
  }: {
    claim: AgentChatStreamClaim;
    turnId: string;
    startTurn: (
      writer: UIMessageStreamWriter<ExtendedUIMessage>,
    ) => Promise<TStarted>;
  }): Promise<AgentTurnStreamResult & { started: TStarted }> {
    const { workspaceId, threadId, streamId } = claim;
    const assistantMessageId = uuidv5(streamId, ASSISTANT_MESSAGE_ID_NAMESPACE);
    const usage: AgentTurnStreamUsage = {
      inputTokens: 0,
      outputTokens: 0,
      inputCredits: 0,
      outputCredits: 0,
      cacheReadTokens: 0,
      cacheCreationTokens: 0,
      conversationSize: 0,
    };
    const result: AgentTurnStreamResult = {
      assistantMessageId,
      replyParts: [],
      isAborted: false,
      streamError: undefined,
      usage,
      modelConfig: null,
    };

    let started: TStarted | undefined;
    let isFinalizing = false;
    let checkpoints: Promise<void> = Promise.resolve();
    let lastCheckpointAt = 0;

    // onEnd fires before the stream drains, so the result is read once it has run
    let markEnded: () => void = () => {};
    const ended = new Promise<void>((resolve) => {
      markEnded = resolve;
    });

    const uiStream = createUIMessageStream<ExtendedUIMessage>({
      execute: async ({ writer }) => {
        started = await startTurn(writer);

        const { source } = started;

        result.modelConfig = source.modelConfig;

        writer.merge(
          toUIMessageStream({
            stream: source.parts,
            onError: formatErrorWithCause,
            sendStart: true,
            sendReasoning: true,
            generateMessageId: () => assistantMessageId,
            messageMetadata: ({ part }) =>
              this.computeMessageMetadata({
                part,
                modelConfig: source.modelConfig,
                usage,
              }),
            onEnd: async ({ responseMessage, isAborted }) => {
              try {
                result.streamError ??= source.getStreamError?.();
                result.replyParts = responseMessage.parts;
                result.isAborted = isAborted;
                isFinalizing = true;
                await source.pendingWrites;
              } finally {
                markEnded();
              }
            },
          }),
        );
      },
      // errors thrown before the model stream merges never reach onEnd
      onError: (error) => {
        result.streamError = error;
        markEnded();

        return formatErrorWithCause(error);
      },
    });

    const [publishStream, checkpointStream] = uiStream.tee();

    void (async () => {
      try {
        for await (const message of readUIMessageStream<ExtendedUIMessage>({
          stream: checkpointStream,
          terminateOnError: false,
        })) {
          const now = Date.now();

          if (
            isFinalizing ||
            message.parts.length === 0 ||
            now - lastCheckpointAt < AGENT_CHAT_CHECKPOINT_INTERVAL_MS
          ) {
            continue;
          }

          lastCheckpointAt = now;
          const parts = message.parts;

          checkpoints = checkpoints
            .then(async () => {
              if (isFinalizing) {
                return;
              }

              await this.conversationWriterService.upsertAssistantMessage({
                workspaceId,
                id: assistantMessageId,
                threadId,
                turnId,
                parts,
              });
            })
            .catch((error) => {
              this.logger.warn(
                `Failed to checkpoint assistant message for stream ${streamId}: ${formatErrorWithCause(error)}`,
              );
            });
        }
      } catch {
        // best-effort; the reply is saved whole once the turn ends
      }
    })();

    for await (const chunk of publishStream) {
      if ((chunk as { type?: string }).type === 'error') {
        continue;
      }

      await this.eventPublisherService.publish({
        threadId,
        workspaceId,
        event: {
          type: 'stream-chunk',
          chunk: chunk as Record<string, unknown>,
        },
      });
    }

    await ended;
    await checkpoints;

    if (!isDefined(started)) {
      throw result.streamError;
    }

    return { ...result, started };
  }

  // Saves the reply and ends the turn, unless another stream took the thread over meanwhile. A turn that
  // waits on a person or an event is recorded as waiting rather than done. A turn whose stream failed
  // only records its usage: its failure is recorded with the stream's claim
  async finishTurn({
    claim,
    turnId,
    result,
    modelId,
    stopReason,
    isWaiting = false,
    isBackgroundRun = false,
  }: {
    claim: AgentChatStreamClaim;
    turnId: string;
    result: AgentTurnStreamResult;
    modelId: string;
    stopReason: StepDebitResult['stopReason'];
    isWaiting?: boolean;
    // a background run's reply stays out of the inbox unless it asks something, and its result
    // stands in for a written reply
    isBackgroundRun?: boolean;
  }): Promise<AgentTurnFinish | null> {
    const { workspaceId, threadId, streamId } = claim;
    const { replyParts, assistantMessageId } = result;
    // a turn that only waits on the member still needs a preview in chat lists
    const replyText =
      findLastMessageText(replyParts) ?? findAwaitingCallText(replyParts);
    const hasText = hasReplyText(replyParts);
    const isSilent = isSilentAgentChatMessageParts(replyParts);
    const awaitingParts = findAwaitingPausingToolParts(replyParts);
    // without an answerable call nothing can resume the turn, so fail rather than wait forever
    const isAwaitingAnswer =
      awaitingParts.length > 0 &&
      awaitingParts.every(({ isAnswerable }) => isAnswerable);
    const outcome = classifyAgentChatTurnOutcome({
      hasText,
      isAborted: result.isAborted,
      isAwaitingUserAnswer: awaitingParts.length > 0 || isWaiting,
      isSilent,
      stopReason,
      isTextReplyRequired: !isBackgroundRun,
    });
    const finishTurn = () =>
      this.turnRecorderService.finish({
        workspaceId,
        turnId,
        ...mapAgentChatTurnOutcomeToTurnStatus(outcome),
        modelId,
        streamClaim: { threadId, streamId },
      });

    await this.turnRecorderService.recordUsage({
      workspaceId,
      threadId,
      turnId,
      usage: result.usage,
    });

    if (isDefined(result.streamError)) {
      return null;
    }

    if (replyParts.length === 0) {
      await finishTurn();

      return { outcome, isAwaitingAnswer, threadBefore: null };
    }

    const threadBefore = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!isDefined(threadBefore) || isDefined(threadBefore.deletedAt)) {
      return {
        outcome: resolveSupersededTurnOutcome(outcome),
        isAwaitingAnswer,
        threadBefore: null,
      };
    }

    await this.conversationWriterService.upsertAssistantMessage({
      workspaceId,
      id: assistantMessageId,
      threadId,
      turnId,
      parts: replyParts,
    });

    const totalsUpdate = await updateAgentChatThreadUsage({
      repository: this.threadRepository,
      workspaceId,
      threadId,
      streamId,
      lastMessageText: replyText,
      shouldRecordActivity: !isSilent && (!isBackgroundRun || isAwaitingAnswer),
      usage: {
        contextWindowTokens: result.modelConfig?.contextWindowTokens ?? null,
        conversationSize: result.usage.conversationSize,
        pendingQuestionMessageId: isAwaitingAnswer ? assistantMessageId : null,
      },
    });

    if (!totalsUpdate.affected) {
      // the reply is saved even though a newer stream owns the thread, and its activity is
      // best-effort so it never turns the saved reply into an error
      if (!isSilent && !isBackgroundRun) {
        await this.threadService
          .recordThreadActivity({ workspaceId, threadId, text: replyText })
          .catch((error: unknown) =>
            this.logger.warn(
              `Could not record reply activity on thread ${threadId}: ${formatErrorWithCause(error)}`,
            ),
          );
      }

      return {
        outcome: resolveSupersededTurnOutcome(outcome),
        isAwaitingAnswer,
        threadBefore: null,
      };
    }

    if (awaitingParts.length > 0 && !isAwaitingAnswer) {
      throw new AiException(
        'A call waiting on the user could not be read',
        AiExceptionCode.INVALID_TOOL_CALL_OUTPUT,
      );
    }

    await finishTurn();

    return { outcome, isAwaitingAnswer, threadBefore };
  }

  // the end event follows every chunk, so a subscriber that sees it has the whole reply
  async publishTurnEnd({
    claim: { workspaceId, threadId },
    assistantMessageId,
    stopReason,
  }: {
    claim: AgentChatStreamClaim;
    assistantMessageId: string;
    stopReason: StepDebitResult['stopReason'];
  }): Promise<void> {
    await this.eventPublisherService.publish({
      threadId,
      workspaceId,
      event:
        stopReason === 'workspaceAllowance'
          ? { type: 'credits-exhausted' }
          : { type: 'message-persisted', messageId: assistantMessageId },
    });
  }

  private computeMessageMetadata({
    part,
    modelConfig,
    usage,
  }: {
    part: {
      type: string;
      usage?: {
        inputTokens?: number;
        outputTokens?: number;
        inputTokenDetails?: { cacheReadTokens?: number };
        outputTokenDetails?: { reasoningTokens?: number };
      };
      providerMetadata?: Record<string, Record<string, unknown> | undefined>;
    };
    modelConfig: AiModelConfig;
    usage: AgentTurnStreamUsage;
  }) {
    if (part.type === 'finish-step') {
      Object.assign(usage, addStepToAgentTurnUsage(modelConfig, usage, part));
      usage.conversationSize = part.usage?.inputTokens ?? 0;
    }

    if (part.type === 'start') {
      return { startedAt: new Date().toISOString() };
    }

    if (part.type === 'finish') {
      const finishedAt = new Date().toISOString();

      return {
        createdAt: finishedAt,
        finishedAt,
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          cachedInputTokens: usage.cacheReadTokens,
          inputCredits: toDisplayCredits(usage.inputCredits),
          outputCredits: toDisplayCredits(usage.outputCredits),
          conversationSize: usage.conversationSize,
        },
        model: {
          contextWindowTokens: modelConfig.contextWindowTokens,
        },
      };
    }

    return undefined;
  }
}
