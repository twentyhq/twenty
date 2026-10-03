import { Injectable } from '@nestjs/common';

import {
  ObjectRecordCreateEvent,
  ObjectRecordDeleteEvent,
  ObjectRecordDestroyEvent,
  ObjectRecordRestoreEvent,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { buildAgentChatThreadUpdateEvent } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-update-event.util';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// chat history writes skip record events, so subscribers only hear of them from here
@Injectable()
export class AgentChatThreadRecordEventService {
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
    const metadata = await this.findThreadMetadata(workspaceId);

    if (!isDefined(thread) || !isDefined(metadata)) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: metadata.objectMetadata.nameSingular,
      action: DatabaseEventAction.CREATED,
      events: [
        Object.assign(
          new ObjectRecordCreateEvent<AgentChatThreadWorkspaceEntity>(),
          { recordId: thread.id, properties: { after: thread } },
        ),
      ],
      objectMetadata: metadata.objectMetadata,
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
    action?:
      | DatabaseEventAction.UPDATED
      | DatabaseEventAction.DELETED
      | DatabaseEventAction.RESTORED;
  }): Promise<void> {
    const storedThreadAfter =
      threadAfter ??
      (await this.findThread({ workspaceId, threadId: threadBefore.id }));
    const metadata = await this.findThreadMetadata(workspaceId);

    if (!isDefined(storedThreadAfter) || !isDefined(metadata)) {
      return;
    }

    const event = buildAgentChatThreadUpdateEvent({
      threadBefore,
      threadAfter: storedThreadAfter,
      objectMetadata: metadata.objectMetadata,
      flatFieldMetadataMaps: metadata.flatFieldMetadataMaps,
    });

    if (!isDefined(event)) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: metadata.objectMetadata.nameSingular,
      action,
      events: [
        action === DatabaseEventAction.DELETED
          ? Object.assign(new ObjectRecordDeleteEvent(), event)
          : action === DatabaseEventAction.RESTORED
            ? Object.assign(new ObjectRecordRestoreEvent(), event)
            : event,
      ],
      objectMetadata: metadata.objectMetadata,
      workspaceId,
    });
  }

  async emitThreadDestroyed({
    workspaceId,
    threadBefore,
  }: {
    workspaceId: string;
    threadBefore: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    const metadata = await this.findThreadMetadata(workspaceId);

    if (!isDefined(metadata)) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: metadata.objectMetadata.nameSingular,
      action: DatabaseEventAction.DESTROYED,
      events: [
        Object.assign(
          new ObjectRecordDestroyEvent<AgentChatThreadWorkspaceEntity>(),
          { recordId: threadBefore.id, properties: { before: threadBefore } },
        ),
      ],
      objectMetadata: metadata.objectMetadata,
      workspaceId,
    });
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

    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    return isDefined(objectMetadata)
      ? { objectMetadata, flatFieldMetadataMaps }
      : undefined;
  }
}
