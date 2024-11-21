import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';

type ActionEventMap<T> = {
  [DatabaseEventAction.CREATED]: ObjectRecordCreateEvent<T>;
  [DatabaseEventAction.UPDATED]: ObjectRecordUpdateEvent<T>;
  [DatabaseEventAction.DELETED]: ObjectRecordDeleteEvent<T>;
  [DatabaseEventAction.DESTROYED]: ObjectRecordDestroyEvent<T>;
};

type CustomEventName = `${string}_${string}`;

@Injectable()
export class WorkspaceEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public emitDatabaseEvents<T, A extends keyof ActionEventMap<T>>({
    objectMetadataNameSingular,
    action,
    events,
    workspaceId,
  }: {
    objectMetadataNameSingular: string;
    action: A;
    events: ActionEventMap<T>[A][];
    workspaceId: string;
  }) {
    if (!events.length) {
      return;
    }

    const eventName = `${objectMetadataNameSingular}.${action}`;

    return this.eventEmitter.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    } satisfies WorkspaceEventBatch<ObjectRecordBaseEvent<T>>);
  }

  public emitCustomEvents(
    eventName: CustomEventName,
    events: object[],
    workspaceId: string,
  ) {
    if (!events.length) {
      return;
    }

    return this.eventEmitter.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    } satisfies WorkspaceEventBatch<any>);
  }
}
