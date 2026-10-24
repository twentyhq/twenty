import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type ResolvedFieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/resolved-field-value-snapshot-field.type';
import { buildReadDeniedFieldNamesForObject } from 'src/engine/metadata-modules/permissions/utils/build-read-denied-field-names-for-object.util';
import { omitReadDeniedFieldsFromFieldValueSnapshot } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-field-value-snapshot.util';
import { resolveFieldValueSnapshotFields } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-fields.util';
import { resolveFieldValueSnapshotSubjectObjectMetadataId } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-subject-object-metadata-id.util';

type EventRecord = Record<string, unknown>;

type SnapshotRedactionContext = {
  snapshotFields: ResolvedFieldValueSnapshotField[];
  objectsPermissions: ObjectsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
};

const resolveReadDeniedFieldNames = ({
  subjectRecord,
  snapshotField,
  objectsPermissions,
  flatFieldMetadataMaps,
}: Omit<SnapshotRedactionContext, 'snapshotFields'> & {
  subjectRecord: EventRecord | undefined;
  snapshotField: ResolvedFieldValueSnapshotField;
}): Set<string> => {
  const subjectObjectMetadataId = isDefined(subjectRecord)
    ? resolveFieldValueSnapshotSubjectObjectMetadataId({
        record: subjectRecord,
        snapshotField,
      })
    : undefined;

  return isDefined(subjectObjectMetadataId)
    ? buildReadDeniedFieldNamesForObject({
        objectMetadataId: subjectObjectMetadataId,
        objectsPermissions,
        flatFieldMetadataMaps,
      })
    : new Set();
};

const omitFromRecordSnapshots = ({
  record,
  subjectRecord,
  snapshotFields,
  ...context
}: SnapshotRedactionContext & {
  record: EventRecord;
  subjectRecord: EventRecord | undefined;
}): EventRecord => ({
  ...record,
  ...Object.fromEntries(
    snapshotFields
      .filter(({ snapshotFieldName }) => snapshotFieldName in record)
      .map((snapshotField) => [
        snapshotField.snapshotFieldName,
        omitReadDeniedFieldsFromFieldValueSnapshot({
          snapshot: record[snapshotField.snapshotFieldName],
          readDeniedFieldNames: resolveReadDeniedFieldNames({
            subjectRecord,
            snapshotField,
            ...context,
          }),
        }),
      ]),
  ),
});

const omitFromDiffSnapshots = ({
  diff,
  subjectRecord,
  snapshotFields,
  ...context
}: SnapshotRedactionContext & {
  diff: EventRecord;
  subjectRecord: EventRecord | undefined;
}): EventRecord => {
  const snapshotFieldDiffs = snapshotFields.flatMap((snapshotField) => {
    const fieldDiff = diff[snapshotField.snapshotFieldName];

    if (!isPlainObject(fieldDiff)) {
      return [];
    }

    const readDeniedFieldNames = resolveReadDeniedFieldNames({
      subjectRecord,
      snapshotField,
      ...context,
    });

    return [
      [
        snapshotField.snapshotFieldName,
        {
          ...fieldDiff,
          before: omitReadDeniedFieldsFromFieldValueSnapshot({
            snapshot: fieldDiff.before,
            readDeniedFieldNames,
          }),
          after: omitReadDeniedFieldsFromFieldValueSnapshot({
            snapshot: fieldDiff.after,
            readDeniedFieldNames,
          }),
        },
      ],
    ];
  });

  return { ...diff, ...Object.fromEntries(snapshotFieldDiffs) };
};

export const omitReadDeniedFieldsFromEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  flatObjectMetadata,
  objectsPermissions,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  flatObjectMetadata: Pick<FlatObjectMetadata, 'id' | 'fieldIds'>;
  objectsPermissions: ObjectsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TEvent => {
  const eventWithoutRestrictedFields = omitRestrictedFieldsFromEvent({
    event,
    restrictedFields:
      objectsPermissions[flatObjectMetadata.id]?.restrictedFields,
    flatFieldMetadataMaps,
  });

  const snapshotFields = resolveFieldValueSnapshotFields({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });

  if (snapshotFields.length === 0) {
    return eventWithoutRestrictedFields;
  }

  const context = { snapshotFields, objectsPermissions, flatFieldMetadataMaps };
  const originalProperties: EventRecord = { ...event.properties };
  const originalBeforeRecord = isPlainObject(originalProperties.before)
    ? originalProperties.before
    : undefined;
  const originalAfterRecord = isPlainObject(originalProperties.after)
    ? originalProperties.after
    : undefined;
  const properties: EventRecord = {
    ...eventWithoutRestrictedFields.properties,
  };
  const beforeRecord = isPlainObject(properties.before)
    ? properties.before
    : undefined;
  const afterRecord = isPlainObject(properties.after)
    ? properties.after
    : undefined;

  return {
    ...eventWithoutRestrictedFields,
    properties: {
      ...properties,
      ...(isDefined(beforeRecord) && {
        before: omitFromRecordSnapshots({
          record: beforeRecord,
          subjectRecord: originalBeforeRecord,
          ...context,
        }),
      }),
      ...(isDefined(afterRecord) && {
        after: omitFromRecordSnapshots({
          record: afterRecord,
          subjectRecord: originalAfterRecord,
          ...context,
        }),
      }),
      ...(isPlainObject(properties.diff) && {
        diff: omitFromDiffSnapshots({
          diff: properties.diff,
          subjectRecord: originalAfterRecord ?? originalBeforeRecord,
          ...context,
        }),
      }),
    },
  };
};
