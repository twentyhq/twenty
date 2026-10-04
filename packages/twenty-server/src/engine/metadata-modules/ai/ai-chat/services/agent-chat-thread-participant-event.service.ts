import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

// Participant rows are written in SQL, outside the ORM that would send these
@Injectable()
export class AgentChatThreadParticipantEventService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async emitParticipantWritten({
    workspaceId,
    before,
    after,
  }: {
    workspaceId: string;
    before: AgentChatThreadParticipantRow | null;
    after: AgentChatThreadParticipantRow;
  }): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);
    const objectMetadata = findAgentChatFlatObjectMetadata(
      flatObjectMetadataMaps,
      'agentChatThreadParticipant',
    );

    if (!isDefined(objectMetadata)) {
      return;
    }

    const event = formatTwentyOrmEventToDatabaseBatchEvent({
      action: isDefined(before)
        ? DatabaseEventAction.UPDATED
        : DatabaseEventAction.CREATED,
      objectMetadataItem: objectMetadata,
      flatFieldMetadataMaps,
      workspaceId,
      recordsBefore: isDefined(before) ? [before] : undefined,
      recordsAfter: [after],
    });

    if (!isDefined(event)) {
      return;
    }

    // Changes can be delivered out of order, and apps keep only the most
    // recent version of a row, so each change carries its version
    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      ...event,
      events: event.events.map((recordEvent) =>
        'updatedFields' in recordEvent.properties
          ? {
              ...recordEvent,
              properties: {
                ...recordEvent.properties,
                updatedFields: [
                  ...(recordEvent.properties.updatedFields ?? []),
                  'updatedAt',
                ],
              },
            }
          : recordEvent,
      ),
    });
  }
}
