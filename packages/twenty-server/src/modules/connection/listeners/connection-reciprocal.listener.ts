import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
} from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { ConnectionReciprocalService } from 'src/modules/connection/services/connection-reciprocal.service';

type ConnectionRecordForEvent = {
  id: string;
  personId: string | null;
  connectedToId: string | null;
  isReciprocal: boolean | null;
};

type ConnectionCreateEvent = ObjectRecordCreateEvent<ConnectionRecordForEvent>;

type ConnectionRemovalEvent =
  | ObjectRecordDeleteEvent<ConnectionRecordForEvent>
  | ObjectRecordDestroyEvent<ConnectionRecordForEvent>;

@Injectable()
export class ConnectionReciprocalListener {
  constructor(
    private readonly connectionReciprocalService: ConnectionReciprocalService,
  ) {}

  // A connection is symmetric but stored in one direction, so the reverse row
  // is generated here. Creating the reverse emits its own create event, which
  // is a no-op because reciprocals are skipped as sources.
  @OnDatabaseBatchEvent('connection', DatabaseEventAction.CREATED)
  async handleConnectionCreated(
    payload: WorkspaceEventBatch<ConnectionCreateEvent>,
  ) {
    await this.connectionReciprocalService.createMissingReciprocals({
      workspaceId: payload.workspaceId,
      connectionIds: payload.events.map((event) => event.recordId),
    });
  }

  @OnDatabaseBatchEvent('connection', DatabaseEventAction.DELETED)
  @OnDatabaseBatchEvent('connection', DatabaseEventAction.DESTROYED)
  async handleConnectionRemoved(
    payload: WorkspaceEventBatch<ConnectionRemovalEvent>,
  ) {
    const connections = payload.events
      .map((event) => {
        const properties = event.properties as {
          before?: Partial<ConnectionRecordForEvent>;
        };

        return properties.before;
      })
      .filter(isDefined)
      .map((before) => ({
        personId: before.personId ?? null,
        connectedToId: before.connectedToId ?? null,
      }));

    await this.connectionReciprocalService.deleteReciprocalsOf({
      workspaceId: payload.workspaceId,
      connections,
    });
  }
}
