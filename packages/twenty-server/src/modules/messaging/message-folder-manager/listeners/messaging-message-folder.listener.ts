import { Injectable, Scope } from '@nestjs/common';

import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable({ scope: Scope.REQUEST })
export class MessagingMessageFolderListener {
  @OnDatabaseBatchEvent('messageFolder', DatabaseEventAction.UPDATED)
  async handleUpdatedEvent(
    _payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<MessageFolderWorkspaceEntity>
    >,
  ): Promise<void> {
    // Retroactive import is now triggered manually via the triggerMessageFolderSync mutation
    // This listener is kept for future use cases
  }
}
