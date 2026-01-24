import {
  ObjectRecordCreateEvent,
  ObjectRecordDeleteEvent,
  ObjectRecordDestroyEvent,
  ObjectRecordRestoreEvent,
  ObjectRecordUpdateEvent,
  ObjectRecordUpsertEvent,
  type ObjectRecordDiff,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  assertUnreachable,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

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
  recordsAfter,
  recordsBefore,
}: {
  action: DatabaseEventAction;
  objectMetadataItem: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  workspaceId: string;
  authContext?: AuthContext;
  recordsAfter?: T[];
  recordsBefore?: T[];
}): DatabaseBatchEventInput<T, DatabaseEventAction> | undefined => {
  if (objectMetadataItem.standardId === STANDARD_OBJECT_IDS.timelineActivity) {
    return;
  }

  const objectMetadataNameSingular = objectMetadataItem.nameSingular;

  let events: (
    | ObjectRecordDeleteEvent<T>
    | ObjectRecordRestoreEvent<T>
    | ObjectRecordUpdateEvent<T>
    | ObjectRecordCreateEvent<T>
    | ObjectRecordDestroyEvent<T>
    | ObjectRecordUpsertEvent<T>
  )[] = [];

  switch (action) {
    case DatabaseEventAction.CREATED: {
      if (!isDefined(recordsAfter)) {
        throw new Error(
          `recordsAfter is required for ${action.toUpperCase()} action`,
        );
      }

      if (!isNonEmptyArray(recordsAfter)) {
        break;
      }

      events =
        recordsAfter?.map((recordAfter) => {
          const event = new ObjectRecordCreateEvent<T>();

          event.userId = authContext?.user?.id;
          event.workspaceMemberId = authContext?.workspaceMemberId;
          event.recordId = recordAfter.id;
          event.properties = { after: recordAfter };

          return event;
        }) ?? [];
      break;
    }
    case DatabaseEventAction.UPDATED:
    case DatabaseEventAction.DELETED:
    case DatabaseEventAction.RESTORED: {
      if (!isDefined(recordsAfter)) {
        throw new Error(
          `recordsAfter is required for ${action.toUpperCase()} action`,
        );
      }

      if (!isDefined(recordsBefore)) {
        throw new Error(
          `recordsBefore is required for ${action.toUpperCase()} action`,
        );
      }

      if (!isNonEmptyArray(recordsAfter)) {
        break;
      }

      events = recordsAfter
        .map((recordAfter) => {
          if (!isNonEmptyArray(recordsBefore)) {
            throw new Error(
              `recordsBefore is required for ${action.toUpperCase()} action`,
            );
          }

          const correspondingRecordBefore = recordsBefore.find(
            (recordBeforeToFind) => recordBeforeToFind.id === recordAfter.id,
          );

          if (!isDefined(correspondingRecordBefore)) {
            throw new TwentyORMException(
              `Record mismatch detected while computing event data for ${action.toUpperCase()} action`,
              TwentyORMExceptionCode.ORM_EVENT_DATA_CORRUPTED,
            );
          }

          const diff = objectRecordChangedValues(
            correspondingRecordBefore,
            recordAfter,
            objectMetadataItem,
            flatFieldMetadataMaps,
          ) as Partial<ObjectRecordDiff<T>>;

          const updatedFields = Object.keys(diff);

          if (updatedFields.length === 0) {
            return;
          }

          const eventPayload = {
            userId: authContext?.user?.id,
            workspaceMemberId: authContext?.workspaceMemberId,
            recordId: recordAfter.id,
            properties: {
              before: correspondingRecordBefore,
              after: recordAfter,
              updatedFields,
              diff,
            },
          } satisfies
            | ObjectRecordUpdateEvent<T>
            | ObjectRecordDeleteEvent<T>
            | ObjectRecordRestoreEvent<T>;

          switch (action) {
            case DatabaseEventAction.DELETED:
              return Object.assign(
                new ObjectRecordDeleteEvent<T>(),
                eventPayload,
              );
            case DatabaseEventAction.UPDATED:
              return Object.assign(
                new ObjectRecordUpdateEvent<T>(),
                eventPayload,
              );
            case DatabaseEventAction.RESTORED:
              return Object.assign(
                new ObjectRecordRestoreEvent<T>(),
                eventPayload,
              );
            default:
              return assertUnreachable(action);
          }
        })
        .filter(isDefined);
      break;
    }
    case DatabaseEventAction.DESTROYED: {
      if (!isDefined(recordsBefore)) {
        throw new Error(`recordsBefore is required for "${action}" action`);
      }

      if (!isNonEmptyArray(recordsBefore)) {
        break;
      }

      events = recordsBefore.map((recordBefore) => {
        const event = new ObjectRecordDestroyEvent<T>();

        event.userId = authContext?.user?.id;
        event.workspaceMemberId = authContext?.workspaceMemberId;
        event.recordId = recordBefore.id;
        event.properties = { before: recordBefore };

        return event;
      });
      break;
    }
    case DatabaseEventAction.UPSERTED: {
      if (!isDefined(recordsAfter)) {
        throw new Error(`recordsAfter is required for "${action}" action`);
      }

      if (!isNonEmptyArray(recordsAfter)) {
        break;
      }

      events = recordsAfter.map((recordAfter) => {
        const event = new ObjectRecordUpsertEvent<T>();

        event.userId = authContext?.user?.id;
        event.workspaceMemberId = authContext?.workspaceMemberId;
        event.recordId = recordAfter.id;

        const correspondingRecordBefore = recordsBefore?.find(
          (recordBeforeToFind) => recordBeforeToFind.id === recordAfter.id,
        );

        let updatedFields;
        let diff;

        diff = objectRecordChangedValues(
          correspondingRecordBefore ?? {},
          recordAfter,
          objectMetadataItem,
          flatFieldMetadataMaps,
        ) as Partial<ObjectRecordDiff<T>>;

        updatedFields = Object.keys(diff);

        event.properties = {
          after: recordAfter,
          ...(correspondingRecordBefore && {
            before: correspondingRecordBefore,
          }),
          ...(diff && { diff }),
          ...(updatedFields && { updatedFields }),
        };

        return event;
      });
      break;
    }

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
