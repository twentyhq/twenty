import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type AgentChatChannelMemberWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel-member.workspace-entity';
import { type AgentChatChannelWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel.workspace-entity';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { formatTwentyOrmEventToDatabaseBatchEvent } from 'src/engine/twenty-orm/utils/format-twenty-orm-event-to-database-batch-event.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type ChannelRecord =
  | AgentChatChannelWorkspaceEntity
  | AgentChatChannelMemberWorkspaceEntity;

// Channels and their members are written in SQL, outside the ORM that would
// send these
@Injectable()
export class AgentChatChannelRecordEventService {
  private readonly logger = new Logger(AgentChatChannelRecordEventService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  // Sent once the write has committed, so a failure here must not report the
  // write itself as failed
  async emit({
    workspaceId,
    objectName,
    action,
    recordsBefore,
    recordsAfter,
  }: {
    workspaceId: string;
    objectName: 'agentChatChannel' | 'agentChatChannelMember';
    action:
      | DatabaseEventAction.CREATED
      | DatabaseEventAction.UPDATED
      | DatabaseEventAction.DESTROYED;
    recordsBefore?: ChannelRecord[];
    recordsAfter?: ChannelRecord[];
  }): Promise<void> {
    if ((recordsAfter ?? recordsBefore ?? []).length === 0) {
      return;
    }

    try {
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ]);
      const objectMetadata = findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        objectName,
      );

      if (!isDefined(objectMetadata)) {
        return;
      }

      const event = formatTwentyOrmEventToDatabaseBatchEvent({
        action,
        objectMetadataItem: objectMetadata,
        flatFieldMetadataMaps,
        workspaceId,
        recordsBefore,
        recordsAfter,
      });

      if (isDefined(event)) {
        this.workspaceEventEmitter.emitDatabaseBatchEvent(event);
      }
    } catch (error) {
      this.logger.error(
        `Could not send the ${objectName} change of workspace ${workspaceId}`,
        error,
      );
    }
  }
}
