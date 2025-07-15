import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import deepEqual from 'deep-equal';
import { ObjectLiteral } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
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

  async emitMutationEvent<T extends ObjectLiteral>({
    action,
    objectMetadata,
    workspaceId,
    entities,
    beforeEntities,
  }: {
    action: DatabaseEventAction;
    objectMetadata: ObjectMetadataItemWithFieldMaps;
    workspaceId: string;
    entities: T | T[];
    beforeEntities?: T | T[];
  }) {
    const objectMetadataNameSingular = objectMetadata.nameSingular;
    const fields = Object.values(objectMetadata.fieldsById ?? {});
    const entityArray = Array.isArray(entities) ? entities : [entities];
    let events: (
      | ObjectRecordCreateEvent<T>
      | ObjectRecordUpdateEvent<T>
      | ObjectRecordDeleteEvent<T>
    )[] = [];

    switch (action) {
      case DatabaseEventAction.CREATED:
        events = entityArray.map((after) => {
          const event = new ObjectRecordCreateEvent<T>();

          event.recordId = after.id;
          event.objectMetadata = { ...objectMetadata, fields };
          event.properties = { after };

          return event;
        });
        break;
      case DatabaseEventAction.UPDATED:
        events = entityArray.map((after, idx) => {
          const before = Array.isArray(beforeEntities)
            ? beforeEntities?.[idx]
            : beforeEntities;

          const event = new ObjectRecordUpdateEvent<T>();

          const updatedFields = this.getUpdatedFields<T>(
            before ?? after,
            after,
          );

          event.recordId = after.id;
          event.objectMetadata = { ...objectMetadata, fields };
          event.properties = { before: before ?? after, after, updatedFields };

          return event;
        });
        break;
      case DatabaseEventAction.DELETED:
        events = entityArray.map((before) => {
          const event = new ObjectRecordDeleteEvent<T>();

          event.recordId = before.id;
          event.objectMetadata = { ...objectMetadata, fields };
          event.properties = { before };

          return event;
        });
        break;
      default:
        return;
    }

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

  private getUpdatedFields = <T extends ObjectLiteral>(
    before: T,
    after: T,
  ): string[] => {
    const updatedFields: string[] = [];

    if (!before || !after) {
      return updatedFields;
    }

    const keys = Array.from(
      new Set([...Object.keys(before), ...Object.keys(after)]),
    ) as (keyof T)[];

    for (const key of keys) {
      const beforeValue = before[key];
      const afterValue = after[key];

      if (
        typeof beforeValue === 'object' &&
        beforeValue !== null &&
        typeof afterValue === 'object' &&
        afterValue !== null
      ) {
        if (!deepEqual(beforeValue, afterValue)) {
          updatedFields.push(key as string);
        }
      } else {
        if (beforeValue !== afterValue) {
          updatedFields.push(key as string);
        }
      }
    }

    const filteredUpdatedFields = updatedFields.filter(
      (field) => field !== 'updatedAt' && field !== 'searchVector',
    );

    return filteredUpdatedFields;
  };

  public emitDatabaseBatchEvent<T, A extends keyof ActionEventMap<T>>({
    objectMetadataNameSingular,
    action,
    events,
    workspaceId,
  }: {
    objectMetadataNameSingular: string;
    action: A;
    events: ActionEventMap<T>[A][];
    workspaceId: string | undefined;
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
    workspaceId: string | undefined,
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
