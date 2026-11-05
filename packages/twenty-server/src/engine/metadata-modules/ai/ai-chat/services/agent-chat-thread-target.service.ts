import { doNotTranslate } from 'twenty-shared/i18n';
import { Injectable } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { findAgentChatThreadTargetJoinColumnName } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-thread-target-join-column-name.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { AgentChatThreadConversationType } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-chat-thread-conversation-type.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME = 'agentChatThreadTarget';

type RecordReference = {
  objectNameSingular: string;
  recordId: string;
};

type ThreadRecordLinkArgs = RecordReference & {
  workspaceId: string;
  threadId: string;
  authContext: WorkspaceAuthContext;
};

@Injectable()
export class AgentChatThreadTargetService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly agentChatThreadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
  ) {}

  // chat turns run in a queue worker, so the sender's context is passed to write the link as them
  async attachThreadToRecord(args: ThreadRecordLinkArgs): Promise<void> {
    await this.writeLinkToReadableRecord({
      ...args,
      writeLink: async (link) => {
        const repository = this.getThreadTargetRepository();

        // only standard legs have a unique index, so custom-object links are deduplicated by lookup
        if (await repository.existsBy(link)) {
          return;
        }

        await repository.insert(link, { onConflictDoNothing: true });
      },
    });
  }

  async detachThreadFromRecord(args: ThreadRecordLinkArgs): Promise<void> {
    await this.writeLinkToReadableRecord({
      ...args,
      writeLink: (link) => this.getThreadTargetRepository().softDelete(link),
    });
  }

  private async writeLinkToReadableRecord({
    workspaceId,
    threadId,
    objectNameSingular,
    recordId,
    authContext,
    writeLink,
  }: ThreadRecordLinkArgs & {
    writeLink: (link: Record<string, string>) => Promise<unknown>;
  }): Promise<void> {
    const joinColumnName = await this.resolveJoinColumnNameOrThrow({
      workspaceId,
      objectNameSingular,
    });

    await this.assertAgentChatThreadAcceptsRecordLinksOrThrow({
      workspaceId,
      threadId,
    });

    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      // A record in the trash keeps its links, but nothing new is filed under it.
      await this.assertRecordIsReadableOrThrow({
        objectNameSingular,
        recordId,
      });

      await writeLink({ threadId, [joinColumnName]: recordId });
    }, authContext);
  }

  private async assertAgentChatThreadAcceptsRecordLinksOrThrow({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const agentChatThread = await this.agentChatThreadRepository.findOne(
      workspaceId,
      { where: { id: threadId }, select: ['id', 'conversationType'] },
    );

    if (!isDefined(agentChatThread)) {
      return throwAgentChatThreadNotFound();
    }

    if (
      agentChatThread.conversationType ===
      AgentChatThreadConversationType.DIRECT_MESSAGE
    ) {
      throw new AiException(
        doNotTranslate('Direct messages do not support linked records'),
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }
  }

  private getThreadTargetRepository() {
    return this.workspaceOrmManager.getRepository(
      AGENT_CHAT_THREAD_TARGET_OBJECT_METADATA_NAME,
    );
  }

  private async assertRecordIsReadableOrThrow({
    objectNameSingular,
    recordId,
  }: RecordReference): Promise<void> {
    const record = await this.workspaceOrmManager
      .getRepository(objectNameSingular)
      .findOne({ where: { id: recordId }, select: { id: true } })
      .catch((error: unknown) => {
        if (
          error instanceof PermissionsException &&
          error.code === PermissionsExceptionCode.PERMISSION_DENIED
        ) {
          return null;
        }

        throw error;
      });

    // not-found rather than forbidden so members cannot probe for records outside their grants
    if (!isDefined(record)) {
      throw new AiException(
        'Record not found',
        AiExceptionCode.RECORD_NOT_FOUND,
      );
    }
  }

  private async resolveJoinColumnNameOrThrow({
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

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
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

    const joinColumnName = findAgentChatThreadTargetJoinColumnName({
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      objectMetadataId,
    });

    if (!isDefined(joinColumnName)) {
      throw new AiException(
        `Conversations cannot be attached to ${objectNameSingular} records`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return joinColumnName;
  }
}
