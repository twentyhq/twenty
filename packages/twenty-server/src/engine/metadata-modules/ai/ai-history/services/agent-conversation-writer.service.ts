import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { findAwaitingPausingToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool-parts.util';
import { mapAiStepsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ai-steps-to-ui-message-parts.util';
import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';
import { stampPendingToolPartsAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-history/utils/stamp-pending-tool-parts-awaited-by-caller.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryTransactionService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-transaction.service';
import { AgentHistoryUpgradeFenceService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-upgrade-fence.service';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';
import { isAgentTurnStatusFinal } from 'src/engine/metadata-modules/ai/ai-history/utils/is-agent-turn-status-final.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentConversationWriterService {
  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    private readonly transactionService: AgentHistoryTransactionService,
    private readonly upgradeFenceService: AgentHistoryUpgradeFenceService,
  ) {}

  runInTransaction<TResult>(
    workspaceId: string,
    work: (scope: AgentHistoryTransactionScope) => Promise<TResult>,
  ): Promise<TResult> {
    return this.transactionService.run(workspaceId, work);
  }

  async insertTurn({
    workspaceId,
    threadId,
    agentId,
    status,
    createdBy,
    id,
    scope,
  }: {
    workspaceId: string;
    threadId: string;
    agentId: string | null;
    status: AgentTurnStatus;
    createdBy?: ActorMetadata;
    id?: string;
    scope?: AgentHistoryTransactionScope;
  }): Promise<string> {
    const now = new Date().toISOString();
    const values = (await this.upgradeFenceService.hasUpgradedAgentHistory(
      workspaceId,
    ))
      ? {
          threadId,
          agentId,
          status,
          startedAt: now,
          endedAt: isAgentTurnStatusFinal(status) ? now : null,
          ...(isDefined(createdBy) ? { createdBy } : {}),
        }
      : { threadId, agentId };

    if (isDefined(scope)) {
      const turnId = id ?? randomUUID();

      await scope.insert('agentTurn', { id: turnId, ...values });

      return turnId;
    }

    const turnInsertResult = await this.turnRepository.insert(workspaceId, {
      ...(isDefined(id) ? { id } : {}),
      ...values,
    });

    return (id ?? turnInsertResult.identifiers[0].id) as string;
  }

  // A turn the agent opens has no user message: a system message gives the
  // model its context, and is written with the turn so neither exists alone
  async insertAgentOpenedTurn({
    workspaceId,
    threadId,
    turnId,
    contextMessageId,
    context,
  }: {
    workspaceId: string;
    threadId: string;
    turnId?: string;
    contextMessageId?: string;
    context: string;
  }): Promise<string> {
    return this.transactionService.run(workspaceId, async (scope) => {
      const insertedTurnId = await this.insertTurn({
        workspaceId,
        threadId,
        id: turnId,
        agentId: null,
        status: AgentTurnStatus.RUNNING,
        scope,
      });

      await this.insertMessage({
        workspaceId,
        id: contextMessageId,
        threadId,
        turnId: insertedTurnId,
        role: AgentMessageRole.SYSTEM,
        agentId: null,
        senderUserWorkspaceId: null,
        parts: [{ type: 'text', text: context }],
        scope,
      });

      return insertedTurnId;
    });
  }

  // The message and its parts are written together, so a message that
  // exists is complete. A message that awaits an answer also takes the
  // thread's single pending slot in the same write, and fails if another
  // message holds it.
  async insertMessage({
    workspaceId,
    id,
    threadId,
    turnId,
    role,
    agentId,
    senderUserWorkspaceId,
    senderApplicationId,
    isAwaitingAnswer,
    processedAt,
    parts,
    scope,
  }: {
    workspaceId: string;
    id?: string;
    threadId: string;
    turnId: string;
    role: AgentMessageRole;
    agentId: string | null;
    senderUserWorkspaceId: string | null;
    senderApplicationId?: string | null;
    isAwaitingAnswer?: boolean;
    processedAt?: Date;
    parts: ExtendedUIMessagePart[];
    scope?: AgentHistoryTransactionScope;
  }): Promise<string> {
    const messageId = id ?? randomUUID();

    const write = async (transactionScope: AgentHistoryTransactionScope) => {
      await transactionScope.insert('agentMessage', {
        id: messageId,
        threadId,
        turnId,
        role,
        agentId,
        processedAt: (processedAt ?? new Date()).toISOString(),
        ...(isDefined(senderUserWorkspaceId) ? { senderUserWorkspaceId } : {}),
        ...(isDefined(senderApplicationId) ? { senderApplicationId } : {}),
      });

      const dbParts = mapUIMessagePartsToDBParts(parts, messageId);

      if (dbParts.length > 0) {
        await transactionScope.insert('agentMessagePart', dbParts);
      }

      if (!isAwaitingAnswer) {
        return;
      }

      const claimedThreadCount = await transactionScope.update(
        'agentChatThread',
        { id: threadId, pendingQuestionMessageId: IsNull() },
        { pendingQuestionMessageId: messageId },
      );

      if (claimedThreadCount === 0) {
        throw new AiException(
          'The conversation is waiting for an answer to an earlier question',
          AiExceptionCode.THREAD_AWAITING_ANSWER,
        );
      }

      if (await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId)) {
        await transactionScope.update(
          'agentTurn',
          { id: turnId },
          { status: AgentTurnStatus.WAITING_FOR_INPUT, endedAt: null },
        );
      }
    };

    if (isDefined(scope)) {
      await write(scope);
    } else {
      await this.transactionService.run(workspaceId, write);
    }

    return messageId;
  }

  // One unanswerable call would keep the conversation waiting forever, so it is recorded as not waiting
  async insertExecutionReply({
    workspaceId,
    threadId,
    turnId,
    agentId,
    execution,
    scope,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    agentId: string | null;
    execution: RecordableAgentExecution;
    scope?: AgentHistoryTransactionScope;
  }): Promise<{
    isAwaitingAnswer: boolean;
    replyParts: ExtendedUIMessagePart[];
  }> {
    // every executed run has a caller waiting on the calls it pauses on
    const replyParts = stampPendingToolPartsAwaitedByCaller(
      mapAiStepsToUIMessageParts(execution.steps ?? []),
    );

    if (replyParts.length === 0) {
      return { isAwaitingAnswer: false, replyParts };
    }

    const awaitingParts = findAwaitingPausingToolParts(replyParts);
    const isAwaitingAnswer =
      execution.isPaused === true &&
      awaitingParts.length > 0 &&
      awaitingParts.every(({ isAnswerable }) => isAnswerable);

    await this.insertMessage({
      workspaceId,
      threadId,
      turnId,
      role: AgentMessageRole.ASSISTANT,
      agentId,
      senderUserWorkspaceId: null,
      isAwaitingAnswer,
      parts: replyParts,
      scope,
    });

    return { isAwaitingAnswer, replyParts };
  }
}
