import { Injectable } from '@nestjs/common';

import {
  ObjectRecordCreateEvent,
  ObjectRecordDestroyEvent,
  ObjectRecordUpdateEvent,
  type ObjectRecordDiff,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type AgentChatThreadFieldName = keyof AgentChatThreadWorkspaceEntity & string;

type AgentChatThreadRecordEvent =
  | ObjectRecordCreateEvent<AgentChatThreadWorkspaceEntity>
  | ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>
  | ObjectRecordDestroyEvent<AgentChatThreadWorkspaceEntity>;

// Chat history writes go through a repository that skips record events, so
// subscribers of the record API (live lists, webhooks, triggers) only learn
// about server-side thread changes from what this service emits.
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

    if (!isDefined(thread)) {
      return;
    }

    await this.emit({
      workspaceId,
      action: DatabaseEventAction.CREATED,
      buildEvent: () =>
        Object.assign(
          new ObjectRecordCreateEvent<AgentChatThreadWorkspaceEntity>(),
          { recordId: thread.id, properties: { after: thread } },
        ),
    });
  }

  // Callers name the fields their write changed: the write happened in SQL
  // they own, so the previous values are only known when they pass them.
  async emitThreadUpdated({
    workspaceId,
    threadId,
    updatedFields,
    threadBefore,
  }: {
    workspaceId: string;
    threadId: string;
    updatedFields: AgentChatThreadFieldName[];
    threadBefore?: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    const threadAfter = await this.findThread({ workspaceId, threadId });

    if (!isDefined(threadAfter)) {
      return;
    }

    const recordBefore = threadBefore ?? threadAfter;

    await this.emit({
      workspaceId,
      action: DatabaseEventAction.UPDATED,
      buildEvent: ({ objectMetadata, flatFieldMetadataMaps }) =>
        Object.assign(
          new ObjectRecordUpdateEvent<AgentChatThreadWorkspaceEntity>(),
          {
            recordId: threadAfter.id,
            properties: {
              before: recordBefore,
              after: threadAfter,
              updatedFields,
              diff: objectRecordChangedValues(
                recordBefore,
                threadAfter,
                objectMetadata,
                flatFieldMetadataMaps,
              ) as Partial<ObjectRecordDiff<AgentChatThreadWorkspaceEntity>>,
            },
          },
        ),
    });
  }

  async emitThreadDestroyed({
    workspaceId,
    threadBefore,
  }: {
    workspaceId: string;
    threadBefore: AgentChatThreadWorkspaceEntity;
  }): Promise<void> {
    await this.emit({
      workspaceId,
      action: DatabaseEventAction.DESTROYED,
      buildEvent: () =>
        Object.assign(
          new ObjectRecordDestroyEvent<AgentChatThreadWorkspaceEntity>(),
          { recordId: threadBefore.id, properties: { before: threadBefore } },
        ),
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

  private async emit({
    workspaceId,
    action,
    buildEvent,
  }: {
    workspaceId: string;
    action: DatabaseEventAction;
    buildEvent: (context: {
      objectMetadata: FlatObjectMetadata;
      flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    }) => AgentChatThreadRecordEvent;
  }): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const objectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.agentChatThread.universalIdentifier
      ];

    if (!isDefined(objectMetadata)) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectMetadata.nameSingular,
      action,
      events: [buildEvent({ objectMetadata, flatFieldMetadataMaps })],
      objectMetadata,
      workspaceId,
    });
  }
}
