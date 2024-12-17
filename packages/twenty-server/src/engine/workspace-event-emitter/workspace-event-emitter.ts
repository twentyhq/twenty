import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { CustomEventName } from 'src/engine/workspace-event-emitter/types/custom-event-name.type';

type ActionEventMap<T> = {
  [DatabaseEventAction.CREATED]: ObjectRecordCreateEvent<T>;
  [DatabaseEventAction.UPDATED]: ObjectRecordUpdateEvent<T>;
  [DatabaseEventAction.DELETED]: ObjectRecordDeleteEvent<T>;
  [DatabaseEventAction.DESTROYED]: ObjectRecordDestroyEvent<T>;
  [DatabaseEventAction.RESTORED]: ObjectRecordRestoreEvent<T>;
};

@Injectable()
export class WorkspaceEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public emitDatabaseBatchEvent<T, A extends keyof ActionEventMap<T>>({
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

    this.eventEmitter.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    });
  }

  public emitCustomBatchEvent<T extends object>(
    eventName: CustomEventName,
    events: T[],
    workspaceId: string,
  ) {
    if (!events.length) {
      return;
    }

    this.eventEmitter.emit(eventName, {
      name: eventName,
      workspaceId,
      events,
    });
  }
}
