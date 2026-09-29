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

// Side effects a conversation needs whichever API changed it: the chat
// commands call these directly, and the record API reaches them through the
// agentChatThread query hooks.
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

  // A record update only says which rows it touched, not whether it archived
  // them, so the stored archivedAt decides. Repeating this for a thread that
  // was already archived is harmless: it has no stream and no sandbox left.
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
      if (isNonEmptyString(archivedThread.activeStreamId)) {
        await this.stopStream({
          workspaceId,
          threadId: archivedThread.id,
          streamId: archivedThread.activeStreamId,
        });
      }

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

  // The owner field is not writable through the record API, so a conversation
  // created there is attributed to its creator once it exists. Threads that
  // already have an owner or belong to a workflow run are left alone, which
  // keeps an upsert onto an existing thread from reassigning it.
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

    const { generatedMaps: assignedThreads } =
      await this.threadRepository.update(
        workspaceId,
        {
          id: In(threadIds),
          workspaceMemberId: IsNull(),
          ...(hasWorkflowRunThreadFields(flatFieldMetadataMaps)
            ? { workflowRunId: IsNull() }
            : {}),
        },
        {
          workspaceMemberId: authContext.workspaceMemberId,
          ...(writesLegacyOwner
            ? { userWorkspaceId: authContext.userWorkspaceId }
            : {}),
        },
      );

    for (const { id } of assignedThreads as { id: string }[]) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadId: id,
        updatedFields: [
          'workspaceMember',
          'workspaceMemberId',
          ...(writesLegacyOwner ? (['userWorkspaceId'] as const) : []),
        ],
      });
    }
  }

  private async stopStream({
    workspaceId,
    threadId,
    streamId,
  }: {
    workspaceId: string;
    threadId: string;
    streamId: string;
  }): Promise<void> {
    await this.cancelStream({ threadId, streamId });

    const { affected } = await this.threadRepository.update(
      workspaceId,
      { id: threadId, activeStreamId: streamId },
      { activeStreamId: null },
    );

    if (affected > 0) {
      await this.threadRecordEventService.emitThreadUpdated({
        workspaceId,
        threadId,
        updatedFields: ['activeStreamId', 'updatedAt'],
      });
    }
  }
}
