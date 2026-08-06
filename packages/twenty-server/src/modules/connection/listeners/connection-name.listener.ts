import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { ConnectionNameService } from 'src/modules/connection/services/connection-name.service';

type ConnectionRecordForEvent = {
  id: string;
  name: string | null;
};

type ConnectionEvent =
  | ObjectRecordCreateEvent<ConnectionRecordForEvent>
  | ObjectRecordUpdateEvent<ConnectionRecordForEvent>;

@Injectable()
export class ConnectionNameListener {
  constructor(private readonly connectionNameService: ConnectionNameService) {}

  // The junction picker on a person record writes only the two join columns, so
  // a connection created that way has no label and renders as "Untitled".
  // Naming on update as well covers a connection whose ends are repointed.
  @OnDatabaseBatchEvent('connection', DatabaseEventAction.CREATED)
  @OnDatabaseBatchEvent('connection', DatabaseEventAction.UPDATED)
  async handleConnectionEvent(payload: WorkspaceEventBatch<ConnectionEvent>) {
    const connectionIds = payload.events.map((event) => event.recordId);

    await this.connectionNameService.fillMissingNamesForConnectionIds({
      workspaceId: payload.workspaceId,
      connectionIds,
    });
  }
}
