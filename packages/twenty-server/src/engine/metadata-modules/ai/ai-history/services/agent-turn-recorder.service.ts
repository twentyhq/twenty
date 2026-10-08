import { Injectable, Logger } from '@nestjs/common';

import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { AGENT_TURN_CREDITS_EXHAUSTED_ERROR } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-turn-credits-exhausted-error.constant';
import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentChatRecordEventService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-chat-record-event.service';
import { AgentHistoryUpgradeFenceService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-upgrade-fence.service';
import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-workspace-storage.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentTurnUsage } from 'src/engine/metadata-modules/ai/ai-billing/types/agent-turn-usage.type';
import { type RecordableAgentExecution } from 'src/engine/metadata-modules/ai/ai-history/types/recordable-agent-execution.type';
import { buildEndWaitingAgentTurnQuery } from 'src/engine/metadata-modules/ai/ai-history/utils/build-end-waiting-agent-turn-query.util';
import { buildReleaseStreamClaimQuery } from 'src/engine/metadata-modules/ai/ai-history/utils/build-release-stream-claim-query.util';
import { isAgentTurnStatusFinal } from 'src/engine/metadata-modules/ai/ai-history/utils/is-agent-turn-status-final.util';

export type AgentTurnStreamClaim = {
  threadId: string;
  streamId: string;
};

const buildStreamClaimCondition = ({
  table,
  streamClaim,
  firstParameterIndex,
}: {
  table: AgentHistoryStorageContext['table'];
  streamClaim?: AgentTurnStreamClaim;
  firstParameterIndex: number;
}) =>
  isDefined(streamClaim)
    ? ` AND EXISTS (SELECT 1 FROM ${table('agentChatThread')} WHERE id = $${firstParameterIndex} AND "activeStreamId" = $${firstParameterIndex + 1})`
    : '';

const buildStreamClaimParameters = (streamClaim?: AgentTurnStreamClaim) =>
  isDefined(streamClaim) ? [streamClaim.threadId, streamClaim.streamId] : [];

@Injectable()
export class AgentTurnRecorderService {
  private readonly logger = new Logger(AgentTurnRecorderService.name);

  constructor(
    @InjectAgentHistoryRepository('agentTurn')
    private readonly turnRepository: AgentHistoryRepository<AgentTurnWorkspaceEntity>,
    private readonly upgradeFenceService: AgentHistoryUpgradeFenceService,
    private readonly recordEventService: AgentChatRecordEventService,
  ) {}

  // Without the 2.46 run fields a turn records nothing, so only the stream
  // claim is checked
  private async touchTurn({
    workspaceId,
    turnId,
    streamClaim,
  }: {
    workspaceId: string;
    turnId: string;
    streamClaim?: AgentTurnStreamClaim;
  }): Promise<boolean> {
    return this.turnRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const touchedTurns = await manager.query<{ id: string }[]>(
          `UPDATE ${table('agentTurn')} SET "updatedAt" = now()
         WHERE id = $1${buildStreamClaimCondition({ table, streamClaim, firstParameterIndex: 2 })}
         RETURNING id`,
          [turnId, ...buildStreamClaimParameters(streamClaim)],
        );

        return touchedTurns.length > 0;
      },
    );
  }

  // A resumed or retried turn runs again, so it keeps its first start. Its
  // creator is whoever first ran it: chat turns are inserted before their
  // sender is known, so they carry the default creator until then
  async markRunning({
    workspaceId,
    turnId,
    modelId,
    createdBy,
    streamClaim,
  }: {
    workspaceId: string;
    turnId: string;
    modelId?: string;
    createdBy?: ActorMetadata;
    streamClaim?: AgentTurnStreamClaim;
  }): Promise<boolean> {
    if (
      !(await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId))
    ) {
      return this.touchTurn({ workspaceId, turnId, streamClaim });
    }

    return this.turnRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const isDefaultCreator = `"createdBySource" = '${FieldActorSource.SYSTEM}' AND $3::boolean`;

        const runningTurns = await manager.query<{ id: string }[]>(
          `UPDATE ${table('agentTurn')} SET
           "status" = '${AgentTurnStatus.RUNNING}',
           "startedAt" = COALESCE("startedAt", now()),
           "endedAt" = NULL,
           "error" = NULL,
           "modelId" = COALESCE($2, "modelId"),
           "createdByWorkspaceMemberId" = CASE WHEN ${isDefaultCreator} THEN $5::uuid ELSE "createdByWorkspaceMemberId" END,
           "createdByName" = CASE WHEN ${isDefaultCreator} THEN $6 ELSE "createdByName" END,
           "createdByContext" = CASE WHEN ${isDefaultCreator} THEN $7::jsonb ELSE "createdByContext" END,
           "createdBySource" = CASE WHEN ${isDefaultCreator} THEN $4 ELSE "createdBySource" END,
           "updatedAt" = now()
         WHERE id = $1${buildStreamClaimCondition({ table, streamClaim, firstParameterIndex: 8 })}
         RETURNING id`,
          [
            turnId,
            modelId ?? null,
            isDefined(createdBy),
            createdBy?.source ?? FieldActorSource.SYSTEM,
            createdBy?.workspaceMemberId ?? null,
            createdBy?.name ?? null,
            JSON.stringify(createdBy?.context ?? {}),
            ...buildStreamClaimParameters(streamClaim),
          ],
        );

        return runningTurns.length > 0;
      },
    );
  }

  // A stream that lost its claim leaves the turn to whoever took the claim
  async finish({
    workspaceId,
    turnId,
    status,
    error = null,
    modelId,
    streamClaim,
  }: {
    workspaceId: string;
    turnId: string;
    status: AgentTurnStatus;
    error?: StreamErrorPayload | null;
    modelId?: string;
    streamClaim?: AgentTurnStreamClaim;
  }): Promise<boolean> {
    if (
      !(await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId))
    ) {
      return this.touchTurn({ workspaceId, turnId, streamClaim });
    }

    return this.turnRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const finishedTurns = await manager.query<{ id: string }[]>(
          `UPDATE ${table('agentTurn')} SET
           "status" = $2,
           "error" = $3::jsonb,
           "endedAt" = $4,
           "modelId" = COALESCE($5, "modelId"),
           "updatedAt" = now()
         WHERE id = $1${buildStreamClaimCondition({ table, streamClaim, firstParameterIndex: 6 })}
         RETURNING id`,
          [
            turnId,
            status,
            isDefined(error) ? JSON.stringify(error) : null,
            isAgentTurnStatusFinal(status) ? new Date().toISOString() : null,
            modelId ?? null,
            ...buildStreamClaimParameters(streamClaim),
          ],
        );

        return finishedTurns.length > 0;
      },
    );
  }

  // Ends a turn run outside chat. Its credits were spent even when its reply
  // could not be saved, and a failed usage write must not leave it running
  async finishExecutedTurn({
    workspaceId,
    threadId,
    turnId,
    execution,
    isAwaitingAnswer = false,
    error,
  }: {
    workspaceId: string;
    threadId: string;
    turnId: string;
    execution: RecordableAgentExecution;
    isAwaitingAnswer?: boolean;
    error?: StreamErrorPayload;
  }): Promise<void> {
    if (isDefined(execution.turnUsage)) {
      await this.recordUsage({
        workspaceId,
        threadId,
        turnId,
        usage: execution.turnUsage,
      }).catch((usageError: unknown) => {
        this.logger.error(
          `Failed to record the usage of agent turn ${turnId}: ${usageError instanceof Error ? usageError.message : String(usageError)}`,
        );
      });
    }

    const failureError =
      error ??
      (execution.hasNoMoreAvailableCredits === true
        ? AGENT_TURN_CREDITS_EXHAUSTED_ERROR
        : undefined);

    await this.finish({
      workspaceId,
      turnId,
      modelId: execution.modelId,
      ...(isDefined(failureError)
        ? { status: AgentTurnStatus.FAILED, error: failureError }
        : {
            status: isAwaitingAnswer
              ? AgentTurnStatus.WAITING_FOR_INPUT
              : AgentTurnStatus.COMPLETED,
          }),
    });
  }

  // Credits were spent whatever became of the turn, so usage is never guarded by a stream claim
  async recordUsage({
    workspaceId,
    turnId,
    threadId,
    usage,
  }: {
    workspaceId: string;
    turnId: string;
    threadId: string;
    usage: AgentTurnUsage;
  }): Promise<void> {
    const hasAgentTurnRunFields =
      await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId);

    await this.turnRepository.query(workspaceId, async ({ manager, table }) => {
      if (!hasAgentTurnRunFields) {
        await manager.query(
          `UPDATE ${table('agentChatThread')} SET
             "totalInputTokens" = "totalInputTokens" + $2,
             "totalOutputTokens" = "totalOutputTokens" + $3,
             "totalCacheReadTokens" = "totalCacheReadTokens" + $4,
             "totalCacheCreationTokens" = "totalCacheCreationTokens" + $5,
             "totalInputCredits" = "totalInputCredits" + $6,
             "totalOutputCredits" = "totalOutputCredits" + $7
           WHERE id = $1`,
          [
            threadId,
            usage.inputTokens,
            usage.outputTokens,
            usage.cacheReadTokens,
            usage.cacheCreationTokens,
            usage.inputCredits,
            usage.outputCredits,
          ],
        );

        return;
      }

      // sum in Postgres: JS numbers must never be added to exact NUMERIC totals
      await manager.query(
        `WITH turn AS (
           UPDATE ${table('agentTurn')} SET
             "inputTokens" = COALESCE("inputTokens", 0) + $3,
             "outputTokens" = COALESCE("outputTokens", 0) + $4,
             "cacheReadTokens" = COALESCE("cacheReadTokens", 0) + $5,
             "cacheCreationTokens" = COALESCE("cacheCreationTokens", 0) + $6,
             "inputCredits" = COALESCE("inputCredits", 0) + $7,
             "outputCredits" = COALESCE("outputCredits", 0) + $8,
             "updatedAt" = now()
           WHERE id = $1
           RETURNING id
         )
         UPDATE ${table('agentChatThread')} SET
           "totalInputTokens" = "totalInputTokens" + $3,
           "totalOutputTokens" = "totalOutputTokens" + $4,
           "totalCacheReadTokens" = "totalCacheReadTokens" + $5,
           "totalCacheCreationTokens" = "totalCacheCreationTokens" + $6,
           "totalInputCredits" = "totalInputCredits" + $7,
           "totalOutputCredits" = "totalOutputCredits" + $8
         WHERE id = $2`,
        [
          turnId,
          threadId,
          usage.inputTokens,
          usage.outputTokens,
          usage.cacheReadTokens,
          usage.cacheCreationTokens,
          usage.inputCredits,
          usage.outputCredits,
        ],
      );
    });
  }

  // the waiting turn is the one holding the question, whoever ends the wait
  async endWaitingTurn({
    workspaceId,
    messageId,
    status,
  }: {
    workspaceId: string;
    messageId: string;
    status: AgentTurnStatus.COMPLETED | AgentTurnStatus.CANCELLED;
  }): Promise<void> {
    if (
      !(await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId))
    ) {
      return;
    }

    await this.turnRepository.query(workspaceId, async ({ manager, table }) => {
      await manager.query(buildEndWaitingAgentTurnQuery({ table }), [
        messageId,
        status,
      ]);
    });
  }

  // a thread runs one turn at a time, so the running turn is the one the released stream was running
  async releaseStreamClaim({
    workspaceId,
    threadId,
    streamId,
    endRunningTurn,
  }: AgentTurnStreamClaim & {
    workspaceId: string;
    endRunningTurn?: {
      status: AgentTurnStatus.CANCELLED | AgentTurnStatus.FAILED;
      error?: StreamErrorPayload | null;
    };
  }): Promise<void> {
    const hasAgentTurnRunFields =
      await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId);

    const { threadBefore, threadAfter } = await this.turnRepository.query(
      workspaceId,
      async ({ manager, table }) => {
        const [threadBefore] = await manager.query<ObjectLiteral[]>(
          `SELECT * FROM ${table('agentChatThread')} WHERE id = $1 FOR UPDATE`,
          [threadId],
        );
        const [threadAfter] = await manager.query<ObjectLiteral[]>(
          buildReleaseStreamClaimQuery({ table, hasAgentTurnRunFields }),
          hasAgentTurnRunFields
            ? [
                threadId,
                streamId,
                endRunningTurn?.status ?? null,
                isDefined(endRunningTurn?.error)
                  ? JSON.stringify(endRunningTurn.error)
                  : null,
              ]
            : [threadId, streamId],
        );

        return { threadBefore, threadAfter };
      },
    );

    await this.recordEventService.emit({
      workspaceId,
      objectName: 'agentChatThread',
      before: threadBefore,
      after: threadAfter,
    });
  }

  async findLatestTurn({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<Pick<
    AgentTurnWorkspaceEntity,
    'id' | 'status' | 'error'
  > | null> {
    if (
      !(await this.upgradeFenceService.hasUpgradedAgentHistory(workspaceId))
    ) {
      return null;
    }

    return this.turnRepository.findOne(workspaceId, {
      where: { threadId },
      order: { createdAt: 'DESC', id: 'DESC' },
      select: ['id', 'status', 'error'],
    });
  }

  async findLatestTurnError({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<StreamErrorPayload | null> {
    const latestTurn = await this.findLatestTurn({ workspaceId, threadId });

    return latestTurn?.status === AgentTurnStatus.FAILED
      ? (latestTurn.error ?? null)
      : null;
  }
}
