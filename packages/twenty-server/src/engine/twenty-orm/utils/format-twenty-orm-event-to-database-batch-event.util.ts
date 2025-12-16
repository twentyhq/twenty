import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import {
  ObjectRecordCreateEvent,
  ObjectRecordDeleteEvent,
  ObjectRecordDestroyEvent,
  ObjectRecordUpdateEvent,
  ObjectRecordUpsertEvent,
  type ObjectRecordDiff,
} from 'twenty-shared/database-events';

import type { ObjectLiteral } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import type { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { objectRecordChangedValues } from 'src/engine/core-modules/event-emitter/utils/object-record-changed-values';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import type { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type DatabaseBatchEventInput } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

export const formatTwentyOrmEventToDatabaseBatchEvent = <
  T extends ObjectLiteral,
>({
  action,
  objectMetadataItem,
  flatFieldMetadataMaps,
  workspaceId,
  authContext,
  entities,
  beforeEntities,
}: {
  action: DatabaseEventAction;
  objectMetadataItem: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceId: string;
  authContext?: AuthContext;
  entities: T | T[];
  beforeEntities?: T | T[];
}): DatabaseBatchEventInput<T, DatabaseEventAction> | undefined => {
  if (objectMetadataItem.standardId === STANDARD_OBJECT_IDS.timelineActivity) {
    return;
  }

  const objectMetadataNameSingular = objectMetadataItem.nameSingular;
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
        event.workspaceMemberId = authContext?.workspaceMemberId;
        event.recordId = after.id;
        event.properties = { after };

        return event;
      });
      break;
    case DatabaseEventAction.UPDATED:
      events = entityArray
        .map((after) => {
          if (!beforeEntities) {
            throw new Error('beforeEntities is required for UPDATED action');
          }

          const before = Array.isArray(beforeEntities)
            ? beforeEntities.find((before) => before.id === after.id)
            : beforeEntities;

          if (!isDefined(before)) {
            throw new TwentyORMException(
              'Record mismatch detected while computing event data for UPDATED action',
              TwentyORMExceptionCode.ORM_EVENT_DATA_CORRUPTED,
            );
          }

          const diff = objectRecordChangedValues(
            before,
            after,
            objectMetadataItem,
            flatFieldMetadataMaps,
          ) as Partial<ObjectRecordDiff<T>>;

          const updatedFields = Object.keys(diff);

          if (updatedFields.length === 0) {
            return;
          }

          const event = new ObjectRecordUpdateEvent<T>();

          event.userId = authContext?.user?.id;
          event.workspaceMemberId = authContext?.workspaceMemberId;
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
        event.workspaceMemberId = authContext?.workspaceMemberId;
        event.recordId = before.id;
        event.properties = { before };

        return event;
      });
      break;
    case DatabaseEventAction.DESTROYED:
      events = entityArray.map((before) => {
        const event = new ObjectRecordDestroyEvent<T>();

        event.userId = authContext?.user?.id;
        event.workspaceMemberId = authContext?.workspaceMemberId;
        event.recordId = before.id;
        event.properties = { before };

        return event;
      });
      break;
    case DatabaseEventAction.UPSERTED:
      events = entityArray.map((after) => {
        const event = new ObjectRecordUpsertEvent<T>();

        event.userId = authContext?.user?.id;
        event.workspaceMemberId = authContext?.workspaceMemberId;
        event.recordId = after.id;

        const before = beforeEntities
          ? Array.isArray(beforeEntities)
            ? beforeEntities.find((before) => before.id === after.id)
            : beforeEntities
          : undefined;

        let updatedFields;
        let diff;

        diff = objectRecordChangedValues(
          before ?? {},
          after,
          objectMetadataItem,
          flatFieldMetadataMaps,
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
    objectMetadata: objectMetadataItem,
    workspaceId,
  };
};
