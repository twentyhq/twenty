import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { isDefined } from 'twenty-shared/utils';
import { ObjectLiteral } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ObjectRecordRestoreEvent } from 'src/engine/core-modules/event-emitter/types/object-record-restore.event';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { CustomEventName } from 'src/engine/workspace-event-emitter/types/custom-event-name.type';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

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
    objectMetadataItem,
    workspaceId,
    authContext,
    entities,
    beforeEntities,
  }: {
    action: DatabaseEventAction;
    objectMetadataItem: ObjectMetadataItemWithFieldMaps;
    workspaceId: string;
    authContext?: AuthContext;
    entities: T | T[];
    beforeEntities?: T | T[];
  }) {
    if (
      objectMetadataItem.standardId === STANDARD_OBJECT_IDS.timelineActivity
    ) {
      return;
    }

    const objectMetadataNameSingular = objectMetadataItem.nameSingular;
    const fields = Object.values(objectMetadataItem.fieldsById ?? {});
    const entityArray = isDefined(entities)
      ? Array.isArray(entities)
        ? entities
        : [entities]
      : [];
    let events: (
      | ObjectRecordCreateEvent<T>
      | ObjectRecordUpdateEvent<T>
      | ObjectRecordDeleteEvent<T>
    )[] = [];

    switch (action) {
      case DatabaseEventAction.CREATED:
        events = entityArray.map((after) => {
          const event = new ObjectRecordCreateEvent<T>();

          event.userId = authContext?.user?.id;
          event.recordId = after.id;
          event.objectMetadata = { ...objectMetadataItem, fields };
          event.properties = { after };

          return event;
        });
        break;
      case DatabaseEventAction.UPDATED:
        events = entityArray
          .map((after, idx) => {
            if (!beforeEntities) {
              throw new Error('beforeEntities is required for UPDATED action');
            }

            const before = Array.isArray(beforeEntities)
              ? beforeEntities?.[idx]
              : beforeEntities;

            const diff = objectRecordChangedValues(
              before,
              after,
              objectMetadataItem,
            ) as Partial<ObjectRecordDiff<T>>;

            const updatedFields = Object.keys(diff);

            if (updatedFields.length === 0) {
              return;
            }

            const event = new ObjectRecordUpdateEvent<T>();

            event.userId = authContext?.user?.id;
            event.recordId = after.id;
            event.objectMetadata = { ...objectMetadataItem, fields };
            event.properties = {
              before,
              after,
              updatedFields,
              diff,
            };

            return event;
          })
          .filter(isDefined);
        break;
      case DatabaseEventAction.DELETED:
        events = entityArray.map((before) => {
          const event = new ObjectRecordDeleteEvent<T>();

          event.userId = authContext?.user?.id;
          event.recordId = before.id;
          event.objectMetadata = { ...objectMetadataItem, fields };
          event.properties = { before };

          return event;
        });
        break;
      case DatabaseEventAction.DESTROYED:
        events = entityArray.map((before) => {
          const event = new ObjectRecordDestroyEvent<T>();

          event.userId = authContext?.user?.id;
          event.recordId = before.id;
          event.objectMetadata = { ...objectMetadataItem, fields };
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
