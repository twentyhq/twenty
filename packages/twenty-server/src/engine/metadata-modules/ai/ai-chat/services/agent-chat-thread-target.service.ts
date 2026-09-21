import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type AgentChatThreadTarget } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-target.type';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryStorageService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME = 'agentChatThreadTarget';

type RecordReference = {
  objectNameSingular: string;
  recordId: string;
};

type ThreadRecordArgs = RecordReference & {
  workspaceId: string;
  userWorkspaceId: string;
  threadId: string;
};

@Injectable()
export class AgentChatThreadTargetService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadEntity>,
    private readonly agentHistoryStorageService: AgentHistoryStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async attachThreadToRecord(args: ThreadRecordArgs): Promise<void> {
    const objectMetadataId = await this.resolveObjectMetadataIdOrThrow(args);

    await this.assertThreadIsReadableOrThrow(args);

    await this.withTargetRepository(args.workspaceId, (repository) =>
      repository.insert(
        {
          threadId: args.threadId,
          objectMetadataId,
          recordId: args.recordId,
        },
        { onConflictDoNothing: true },
      ),
    );
  }

  async detachThreadFromRecord(args: ThreadRecordArgs): Promise<void> {
    const objectMetadataId = await this.resolveObjectMetadataIdOrThrow(args);

    await this.assertThreadIsReadableOrThrow(args);

    await this.withTargetRepository(args.workspaceId, (repository) =>
      repository.delete({
        threadId: args.threadId,
        objectMetadataId,
        recordId: args.recordId,
      }),
    );
  }

  async findThreadIdsAttachedToRecord({
    workspaceId,
    userWorkspaceId,
    objectNameSingular,
    recordId,
  }: RecordReference & {
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<string[]> {
    const objectMetadataId = await this.resolveObjectMetadataIdOrThrow({
      workspaceId,
      objectNameSingular,
    });

    const targets = await this.withTargetRepository(workspaceId, (repository) =>
      repository.find({ where: { objectMetadataId, recordId } }),
    );

    const attachedThreadIds = targets.map(({ threadId }) => threadId);

    if (!isNonEmptyArray(attachedThreadIds)) {
      return [];
    }

    return this.filterToReadableThreadIds({
      workspaceId,
      userWorkspaceId,
      threadIds: attachedThreadIds,
    });
  }

  // Ownership is the whole of thread access control today. The owner-managed
  // record grants being added on agentChatThread widen what a member may read,
  // and this pair of methods is the only place that has to learn about them.
  private async filterToReadableThreadIds({
    workspaceId,
    userWorkspaceId,
    threadIds,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    threadIds: string[];
  }): Promise<string[]> {
    const readableThreads = await this.threadRepository.find(workspaceId, {
      where: { id: In(threadIds), userWorkspaceId },
    });

    const readableThreadIds = new Set(readableThreads.map(({ id }) => id));

    // Preserve the order the targets came back in rather than the thread query's.
    return threadIds.filter((threadId) => readableThreadIds.has(threadId));
  }

  private async assertThreadIsReadableOrThrow({
    workspaceId,
    userWorkspaceId,
    threadId,
  }: {
    workspaceId: string;
    userWorkspaceId: string;
    threadId: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: { id: threadId, userWorkspaceId },
    });

    // Not-found rather than forbidden, so a member cannot probe for the
    // existence of someone else's conversation.
    if (!isDefined(thread)) {
      throw new AiException(
        'Thread not found',
        AiExceptionCode.THREAD_NOT_FOUND,
      );
    }
  }

  private async resolveObjectMetadataIdOrThrow({
    workspaceId,
    objectNameSingular,
  }: {
    workspaceId: string;
    objectNameSingular: string;
  }): Promise<string> {
    if (!isNonEmptyString(objectNameSingular)) {
      throw new AiException(
        'An object name is required to attach a conversation to a record',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName: objectNameSingular,
    });

    if (!isDefined(objectMetadataId)) {
      throw new AiException(
        `Unknown object "${objectNameSingular}"`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return objectMetadataId;
  }

  private withTargetRepository<TResult>(
    workspaceId: string,
    work: (
      repository: WorkspaceRepository<AgentChatThreadTarget>,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        // A target's foreign key points at the workspace-schema thread table, so
        // a workspace whose history still routes to core has nothing to attach
        // to. Holding the storage fence keeps the route from flipping mid-write.
        this.agentHistoryStorageService.run(workspaceId, (context) => {
          if (context.storage !== 'workspace') {
            throw new AiException(
              'AI history has not been migrated to this workspace yet',
              AiExceptionCode.INVALID_AGENT_INPUT,
            );
          }

          return work(
            this.workspaceOrmManager.getRepository<AgentChatThreadTarget>(
              AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME,
              { shouldBypassPermissionChecks: true },
              { shouldSkipEventEmission: true },
            ),
          );
        }),
      buildSystemAuthContext(workspaceId),
    );
  }
}
