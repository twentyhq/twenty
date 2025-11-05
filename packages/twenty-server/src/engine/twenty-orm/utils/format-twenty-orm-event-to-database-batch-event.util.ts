import { isDefined } from 'twenty-shared/utils';

import type { ObjectLiteral } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import type { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';
import type { ObjectRecordDiff } from 'src/engine/core-modules/event-emitter/types/object-record-diff';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordUpsertEvent } from 'src/engine/core-modules/event-emitter/types/object-record-upsert.event';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import type { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type DatabaseBatchEventInput } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const formatTwentyOrmEventToDatabaseBatchEvent = <
  T extends ObjectLiteral,
>({
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
}): DatabaseBatchEventInput<T, DatabaseEventAction> | undefined => {
  if (objectMetadataItem.standardId === STANDARD_OBJECT_IDS.timelineActivity) {
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
    | ObjectRecordUpsertEvent<T>
  )[] = [];

  switch (action) {
    case DatabaseEventAction.CREATED:
      events = entityArray.map((after) => {
        const event = new ObjectRecordCreateEvent<T>();

        event.userId = authContext?.user?.id;
        event.recordId = after.id;
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
        event.properties = { before };

        return event;
      });
      break;
    case DatabaseEventAction.DESTROYED:
      events = entityArray.map((before) => {
        const event = new ObjectRecordDestroyEvent<T>();

        event.userId = authContext?.user?.id;
        event.recordId = before.id;
        event.properties = { before };

        return event;
      });
      break;
    case DatabaseEventAction.UPSERTED:
      events = entityArray.map((after, index) => {
        const event = new ObjectRecordUpsertEvent<T>();

        event.userId = authContext?.user?.id;
        event.recordId = after.id;

        const before = beforeEntities
          ? Array.isArray(beforeEntities)
            ? beforeEntities[index]
            : beforeEntities
          : undefined;

        let updatedFields;
        let diff;

        diff = objectRecordChangedValues(
          before ?? {},
          after,
          objectMetadataItem,
        ) as Partial<ObjectRecordDiff<T>>;
        updatedFields = Object.keys(diff);

        event.properties = {
          after,
          ...(before && { before }),
          ...(diff && { diff }),
          ...(updatedFields && { updatedFields }),
        };

        return event;
      });
      break;
    default:
      return;
  }

  if (!events.length) {
    return;
  }

  return {
    objectMetadataNameSingular,
    action,
    events,
    objectMetadata: { ...objectMetadataItem, fields },
    workspaceId,
  };
};
