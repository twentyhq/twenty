import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { getCancelChannel } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-cancel-channel.util';
import { hasLegacyChatThreadOwnerField } from 'src/engine/metadata-modules/ai/ai-chat/utils/has-legacy-chat-thread-owner-field.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { hasWorkflowRunThreadFields } from 'src/engine/metadata-modules/ai/ai-history/utils/has-workflow-run-thread-fields.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentChatThreadLifecycleService {
  private readonly logger = new Logger(AgentChatThreadLifecycleService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly redisClientService: RedisClientService,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
  ) {}

  async cancelActiveStreamIfAny({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });

    if (!isDefined(thread) || !isNonEmptyString(thread.activeStreamId)) {
      return;
    }

    await this.cancelStream({ threadId, streamId: thread.activeStreamId });
  }

  async cancelStream({
    threadId,
    streamId,
  }: {
    threadId: string;
    streamId: string;
  }): Promise<void> {
    await this.redisClientService
      .getClient()
      .publish(getCancelChannel(threadId, streamId), 'cancel');
  }

  releaseThreadSandboxBestEffort({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): void {
    void this.codeInterpreterService
      .releaseThreadSandbox(workspaceId, threadId)
      .catch((error) =>
        this.logger.warn(
          `Failed to release code interpreter sandbox for thread ${threadId}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      );
  }

  // Archiving sets archivedAt rather than soft deleting, so it reaches the
  // update hooks, which only know which rows they touched
  async stopArchivedThreads({
    workspaceId,
    threadIds,
  }: {
    workspaceId: string;
    threadIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(threadIds)) {
      return;
    }

    const archivedThreads = await this.threadRepository.find(workspaceId, {
      where: { id: In(threadIds), archivedAt: Not(IsNull()) },
    });

    for (const archivedThread of archivedThreads) {
      await this.stopStreamIfAny({ workspaceId, thread: archivedThread });

      this.releaseThreadSandboxBestEffort({
        workspaceId,
        threadId: archivedThread.id,
      });
    }
  }

  // Sharing grants stay, as for any destroyed record, so that the destroy
  // event still reaches the thread's audience
  releaseDestroyedThreadSandboxes({
    workspaceId,
    threadIds,
  }: {
    workspaceId: string;
    threadIds: string[];
  }): void {
    for (const threadId of threadIds) {
      this.releaseThreadSandboxBestEffort({ workspaceId, threadId });
    }
  }

  // The owner field is not writable through the record API. Owned and
  // workflow-run threads are skipped so an upsert cannot reassign them
  async assignCreatedThreadsToCreator({
    authContext,
    threadIds,
  }: {
    authContext: WorkspaceAuthContext;
    threadIds: string[];
  }): Promise<void> {
    if (!isUserAuthContext(authContext) || !isNonEmptyArray(threadIds)) {
      return;
    }

    const workspaceId = authContext.workspace.id;
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);
    const writesLegacyOwner = await hasLegacyChatThreadOwnerField(
      workspaceId,
      this.workspaceCacheService,
    );
    const unassignedThreadCriteria = {
      workspaceMemberId: IsNull(),
      ...(hasWorkflowRunThreadFields(flatFieldMetadataMaps)
        ? { workflowRunId: IsNull() }
        : {}),
    };

    const threadsBefore = await this.threadRepository.find(workspaceId, {
      where: { id: In(threadIds), ...unassignedThreadCriteria },
    });

    if (!isNonEmptyArray(threadsBefore)) {
      return;
    }

    const { generatedMaps: assignedThreads } =
      await this.threadRepository.update(
        workspaceId,
        {
          id: In(threadsBefore.map(({ id }) => id)),
          ...unassignedThreadCriteria,
        },
        {
          workspaceMemberId: authContext.workspaceMemberId,
          ...(writesLegacyOwner
            ? { userWorkspaceId: authContext.userWorkspaceId }
            : {}),
        },
      );

    if (!isNonEmptyArray(assignedThreads)) {
      return;
    }

    const threadsAfter = await this.threadRepository.find(workspaceId, {
      where: { id: In(assignedThreads.map(({ id }) => id)) },
    });

    for (const threadAfter of threadsAfter) {
      const threadBefore = threadsBefore.find(
        ({ id }) => id === threadAfter.id,
      );

      if (!isDefined(threadBefore)) {
        continue;
      }

      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore,
        threadAfter,
      });
    }
  }

  private async stopStreamIfAny({
    workspaceId,
    thread,
  }: {
    workspaceId: string;
    thread: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    if (!isNonEmptyString(thread.activeStreamId)) {
      return;
    }

    await this.cancelStream({
      threadId: thread.id,
      streamId: thread.activeStreamId,
    });

    const { affected } = await this.threadRepository.update(
      workspaceId,
      { id: thread.id, activeStreamId: thread.activeStreamId },
      { activeStreamId: null },
    );

    if (affected > 0) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadBefore: thread,
      });
    }
  }
}
