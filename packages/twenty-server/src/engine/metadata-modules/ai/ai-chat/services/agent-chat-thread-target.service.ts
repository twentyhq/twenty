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

const throwHistoryNotMigrated = (): never => {
  throw new AiException(
    'AI history has not been migrated to this workspace yet',
    AiExceptionCode.INVALID_AGENT_INPUT,
  );
};

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
    await this.assertRecordIsReadableOrThrow(args);

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
    await this.assertRecordIsReadableOrThrow(args);

    await this.withTargetRepository(args.workspaceId, (repository) =>
      repository.delete({
        threadId: args.threadId,
        objectMetadataId,
        recordId: args.recordId,
      }),
    );
  }

  // A destroyed record leaves its links behind: the (objectMetadataId, recordId)
  // pair carries no foreign key, so nothing cascades. Without this a record
  // recreated with the same id would inherit the old record's conversations.
  async deleteTargetsForDestroyedRecords({
    workspaceId,
    objectNameSingular,
    recordIds,
  }: {
    workspaceId: string;
    objectNameSingular: string;
    recordIds: string[];
  }): Promise<void> {
    if (!isNonEmptyArray(recordIds)) {
      return;
    }

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName: objectNameSingular,
    });

    // The target object is provisioned per workspace by an upgrade command, so
    // a workspace can destroy records before it has the table at all.
    const isTargetObjectProvisioned = isDefined(
      getObjectMetadataIdByName({
        flatObjectMetadataMaps,
        objectName: AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME,
      }),
    );

    if (!isDefined(objectMetadataId) || !isTargetObjectProvisioned) {
      return;
    }

    await this.withTargetRepository<void>(
      workspaceId,
      async (repository) => {
        await repository.delete({ objectMetadataId, recordId: In(recordIds) });
      },
      // Nothing to clean up in a workspace whose history never left core.
      () => undefined,
    );
  }

  // Resolving the record is the whole of the list path here: the attachment
  // predicate itself lives in the ranked thread query, so paging applies to the
  // ranked conversations rather than to an arbitrary prefix of the links.
  async resolveAuthorizedRecordOrThrow({
    workspaceId,
    objectNameSingular,
    recordId,
  }: RecordReference & { workspaceId: string }): Promise<string> {
    const objectMetadataId = await this.resolveObjectMetadataIdOrThrow({
      workspaceId,
      objectNameSingular,
    });

    await this.assertRecordIsReadableOrThrow({ objectNameSingular, recordId });

    return objectMetadataId;
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

  // Targets are written in system context because the object is SYSTEM-writable,
  // so this lookup is the only point where the caller's own record grants are
  // consulted. It runs before the storage fence, which reserves a core pool
  // connection for the duration of the write.
  private async assertRecordIsReadableOrThrow({
    objectNameSingular,
    recordId,
  }: RecordReference): Promise<void> {
    const record = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepository(objectNameSingular)
          .findOne({ where: { id: recordId }, select: { id: true } }),
    );

    // Not-found rather than forbidden, so a member cannot probe for records
    // outside their grants.
    if (!isDefined(record)) {
      throw new AiException(
        'Record not found',
        AiExceptionCode.RECORD_NOT_FOUND,
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
    onStorageIsCore: () => TResult = throwHistoryNotMigrated,
  ): Promise<TResult> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        // A target's foreign key points at the workspace-schema thread table, so
        // a workspace whose history still routes to core has nothing to attach
        // to. Holding the storage fence keeps the route from flipping mid-write.
        this.agentHistoryStorageService.run(workspaceId, (context) => {
          if (context.storage !== 'workspace') {
            return Promise.resolve(onStorageIsCore());
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
