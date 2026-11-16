import { Injectable } from '@nestjs/common';

import { randomUUID } from 'node:crypto';

import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { mapUIMessagePartsToDBParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-ui-message-parts-to-db-parts.util';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryTransactionService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-transaction.service';
import { type AgentHistoryTransactionScope } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-transaction-scope.type';
import { isAgentTurnStatusFinal } from 'src/engine/metadata-modules/ai/ai-history/utils/is-agent-turn-status-final.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

@Injectable()
export class AgentConversationWriterService {
  constructor(
    private readonly transactionService: AgentHistoryTransactionService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  runInTransaction<TResult>({
    workspaceId,
    threadId,
    work,
  }: {
    workspaceId: string;
    threadId: string | null;
    work: (scope: AgentHistoryTransactionScope) => Promise<TResult>;
  }): Promise<TResult> {
    return this.transactionService.run({ workspaceId, threadId, work });
  }

  // the message is replaced whole, so no reader or crash ever finds it without its parts
  async upsertAssistantMessage({
    workspaceId,
    id,
    threadId,
    turnId,
    agentId,
    parts,
  }: {
    workspaceId: string;
    id: string;
    threadId: string;
    turnId: string;
    agentId: string | null;
    parts: ExtendedUIMessagePart[];
  }): Promise<void> {
    const dbParts = mapUIMessagePartsToDBParts(parts, id);

    await this.transactionService.run({
      workspaceId,
      threadId,
      work: async (scope) => {
        await scope.upsert({
          name: 'agentMessage',
          values: {
            id,
            threadId,
            turnId,
            agentId,
            role: AgentMessageRole.ASSISTANT,
            processedAt: new Date().toISOString(),
          },
          conflictPaths: ['id'],
        });
        await scope.delete({
          name: 'agentMessagePart',
          where: { messageId: id },
        });

        if (dbParts.length > 0) {
          await scope.insert({ name: 'agentMessagePart', values: dbParts });
        }
      },
    });
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
    threadId: string | null;
    agentId: string | null;
    status: AgentTurnStatus;
    createdBy?: ActorMetadata;
    id?: string;
    scope?: AgentHistoryTransactionScope;
  }): Promise<string> {
    const now = new Date().toISOString();
    const values = {
      threadId,
      agentId,
      status,
      startedAt: now,
      endedAt: isAgentTurnStatusFinal(status) ? now : null,
      ...(isDefined(createdBy) ? { createdBy } : {}),
    };

    const turnId = id ?? randomUUID();
    const write = (transactionScope: AgentHistoryTransactionScope) =>
      transactionScope.insert({
        name: 'agentTurn',
        values: { id: turnId, ...values },
      });

    if (isDefined(scope)) {
      await write(scope);
    } else {
      await this.transactionService.run({ workspaceId, threadId, work: write });
    }

    return turnId;
  }

  // A turn the agent opens has no user message: a system message gives the
  // model its context, and is written with the turn so neither exists alone
  async insertAgentOpenedTurn({
    workspaceId,
    threadId,
    turnId,
    contextMessageId,
    context,
    scope,
  }: {
    workspaceId: string;
    threadId: string;
    turnId?: string;
    contextMessageId?: string;
    context: string;
    scope?: AgentHistoryTransactionScope;
  }): Promise<string> {
    const write = async (scope: AgentHistoryTransactionScope) => {
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
    };

    if (isDefined(scope)) {
      return write(scope);
    }

    return this.transactionService.run({ workspaceId, threadId, work: write });
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
    const senderWorkspaceMemberId = await this.findSenderWorkspaceMemberId({
      workspaceId,
      senderUserWorkspaceId,
    });

    const write = async (transactionScope: AgentHistoryTransactionScope) => {
      await transactionScope.insert({
        name: 'agentMessage',
        values: {
          id: messageId,
          threadId,
          turnId,
          role,
          agentId,
          processedAt: (processedAt ?? new Date()).toISOString(),
          ...(isDefined(senderWorkspaceMemberId)
            ? { senderWorkspaceMemberId }
            : {}),
          ...(isDefined(senderApplicationId) ? { senderApplicationId } : {}),
        },
      });

      const dbParts = mapUIMessagePartsToDBParts(parts, messageId);

      if (dbParts.length > 0) {
        await transactionScope.insert({
          name: 'agentMessagePart',
          values: dbParts,
        });
      }

      if (!isAwaitingAnswer) {
        return;
      }

      const claimedThreadCount = await transactionScope.update({
        name: 'agentChatThread',
        where: { id: threadId, pendingQuestionMessageId: IsNull() },
        values: { pendingQuestionMessageId: messageId },
      });

      if (claimedThreadCount === 0) {
        throw new AiException(
          'The conversation is waiting for an answer to an earlier question',
          AiExceptionCode.THREAD_AWAITING_ANSWER,
        );
      }

      await transactionScope.update({
        name: 'agentTurn',
        where: { id: turnId },
        values: { status: AgentTurnStatus.WAITING_FOR_INPUT, endedAt: null },
      });
    };

    if (isDefined(scope)) {
      await write(scope);
    } else {
      await this.transactionService.run({ workspaceId, threadId, work: write });
    }

    return messageId;
  }

  // Callers name the sender by their membership; a sender who has left since
  // is recorded without one
  private async findSenderWorkspaceMemberId({
    workspaceId,
    senderUserWorkspaceId,
  }: {
    workspaceId: string;
    senderUserWorkspaceId: string | null;
  }): Promise<string | null> {
    if (!isDefined(senderUserWorkspaceId)) {
      return null;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    return (
      flatWorkspaceMemberMaps.idByUserWorkspaceId[senderUserWorkspaceId] ?? null
    );
  }
}
