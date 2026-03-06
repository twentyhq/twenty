import { Injectable } from '@nestjs/common';
import { type EventEmitter2 } from '@nestjs/event-emitter';

import { isDefined } from 'twenty-shared/utils';
import {
  type ObjectRecordCreateEvent,
  type ObjectRecordDeleteEvent,
  type ObjectRecordDestroyEvent,
  type ObjectRecordUpdateEvent,
  type ObjectRecordUpsertEvent,
  type ObjectRecordRestoreEvent,
} from 'twenty-shared/database-events';

import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import type { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CustomEventName } from 'src/engine/workspace-event-emitter/types/custom-event-name.type';
import { type CustomWorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/custom-workspace-batch-event.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { computeEventName } from 'src/engine/workspace-event-emitter/utils/compute-event-name';

type ActionEventMap<T> = {
  [DatabaseEventAction.CREATED]: ObjectRecordCreateEvent<T>;
  [DatabaseEventAction.UPDATED]: ObjectRecordUpdateEvent<T>;
  [DatabaseEventAction.DELETED]: ObjectRecordDeleteEvent<T>;
  [DatabaseEventAction.DESTROYED]: ObjectRecordDestroyEvent<T>;
  [DatabaseEventAction.RESTORED]: ObjectRecordRestoreEvent<T>;
  [DatabaseEventAction.UPSERTED]: ObjectRecordUpsertEvent<T>;
};

export type DatabaseBatchEventInput<T, A extends keyof ActionEventMap<T>> = {
  objectMetadataNameSingular: string;
  action: A;
  events: ActionEventMap<T>[A][];
  objectMetadata: FlatObjectMetadata;
  workspaceId: string;
};

@Injectable()
export class WorkspaceEventEmitter {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  public emitDatabaseBatchEvent<T, A extends keyof ActionEventMap<T>>(
    databaseBatchEventInput: DatabaseBatchEventInput<T, A> | undefined,
  ) {
    if (!isDefined(databaseBatchEventInput)) {
      return;
    }

    const {
      objectMetadataNameSingular,
      action,
      events,
      objectMetadata,
      workspaceId,
    } = databaseBatchEventInput;

    if (!events.length) {
      return;
    }

    const eventName = computeEventName(objectMetadataNameSingular, action);

    const workspaceEventBatch: WorkspaceEventBatch<ActionEventMap<T>[A]> = {
      name: eventName,
      workspaceId,
      objectMetadata,
      events,
    };

    this.eventEmitter.emit(eventName, workspaceEventBatch);
  }

  public emitCustomBatchEvent<T extends object>(
    eventName: CustomEventName,
    events: T[],
    workspaceId: string | undefined,
  ) {
    if (!events.length) {
      return;
    }

    const customWorkspaceEventBatch: CustomWorkspaceEventBatch<T> = {
      name: eventName,
      workspaceId,
      events,
    };

    this.eventEmitter.emit(eventName, customWorkspaceEventBatch);
  }
}
