import { Injectable, Logger } from '@nestjs/common';

import {
  ObjectRecordCreateEvent,
  ObjectRecordRestoreEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { buildAgentChatThreadUpdateEvent } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-update-event.util';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// chat history writes skip record events, so subscribers only hear of them from here
@Injectable()
export class AgentChatThreadRecordEventService {
  private readonly logger = new Logger(AgentChatThreadRecordEventService.name);

  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async emitThreadCreated({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const thread = await this.findThread({ workspaceId, threadId });
    const { objectMetadata } = await this.findThreadMetadata(workspaceId);

    if (!isDefined(thread) || !isDefined(objectMetadata)) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadata.nameSingular,
      action: DatabaseEventAction.CREATED,
      events: [
        Object.assign(
          new ObjectRecordCreateEvent<AgentChatThreadWorkspaceEntity>(),
          { recordId: thread.id, properties: { after: thread } },
        ),
      ],
      objectMetadata,
      workspaceId,
    });
  }

  async emitThreadUpdated({
    workspaceId,
    threadBefore,
    threadAfter,
    action = DatabaseEventAction.UPDATED,
  }: {
    workspaceId: string;
    threadBefore: AgentChatThreadWorkspaceEntity;
    threadAfter?: AgentChatThreadWorkspaceEntity;
    action?: DatabaseEventAction.UPDATED | DatabaseEventAction.RESTORED;
  }): Promise<void> {
    const storedThreadAfter =
      threadAfter ??
      (await this.findThread({ workspaceId, threadId: threadBefore.id }));
    const { objectMetadata, flatFieldMetadataMaps } =
      await this.findThreadMetadata(workspaceId);

    if (!isDefined(storedThreadAfter) || !isDefined(objectMetadata)) {
      return;
    }

    const event = buildAgentChatThreadUpdateEvent({
      threadBefore,
      threadAfter: storedThreadAfter,
      objectMetadata,
      flatFieldMetadataMaps,
    });

    if (!isDefined(event)) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadata.nameSingular,
      action,
      events: [
        action === DatabaseEventAction.RESTORED
          ? Object.assign(new ObjectRecordRestoreEvent(), event)
          : event,
      ],
      objectMetadata,
      workspaceId,
    });
  }

  // Chat lists show which chats wait on an answer. The marker is already
  // cleared, so a lost event must not fail the caller
  async emitPendingQuestionCleared({
    workspaceId,
    threadId,
    messageId,
  }: {
    workspaceId: string;
    threadId: string;
    messageId: string;
  }): Promise<void> {
    try {
      const thread = await this.findThread({ workspaceId, threadId });

      if (!isDefined(thread)) {
        return;
      }

      await this.emitThreadUpdated({
        workspaceId,
        threadBefore: { ...thread, pendingQuestionMessageId: messageId },
        threadAfter: thread,
      });
    } catch (error) {
      this.logger.warn(
        `Could not emit the cleared question on thread ${threadId}: ${formatErrorWithCause(error)}`,
      );
    }
  }

  private findThread({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<AgentChatThreadWorkspaceEntity | null> {
    return this.threadRepository.findOne(workspaceId, {
      where: { id: threadId },
    });
  }

  private async findThreadMetadata(workspaceId: string) {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    return {
      objectMetadata: findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThread',
      ),
      flatFieldMetadataMaps,
    };
  }
}
