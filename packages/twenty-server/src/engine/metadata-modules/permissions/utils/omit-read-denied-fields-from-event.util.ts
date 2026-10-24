import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ResolvedFieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/resolved-field-value-snapshot-field.type';
import { buildReadDeniedFieldNamesForObject } from 'src/engine/metadata-modules/permissions/utils/build-read-denied-field-names-for-object.util';
import { omitReadDeniedFieldsFromFieldValueSnapshot } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-field-value-snapshot.util';
import { resolveFieldValueSnapshotFields } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-fields.util';
import { resolveFieldValueSnapshotSubjectObjectMetadataId } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-subject-object-metadata-id.util';

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
  subjectRecord: unknown;
  snapshotField: ResolvedFieldValueSnapshotField;
}): Set<string> => {
  const subjectObjectMetadataId = isPlainObject(subjectRecord)
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
  snapshotFields,
  ...context
}: SnapshotRedactionContext & { record: unknown }): unknown => {
  if (!isPlainObject(record)) {
    return record;
  }

  return {
    ...record,
    ...Object.fromEntries(
      snapshotFields
        .filter(({ snapshotFieldName }) => snapshotFieldName in record)
        .map((snapshotField) => [
          snapshotField.snapshotFieldName,
          omitReadDeniedFieldsFromFieldValueSnapshot({
            snapshot: record[snapshotField.snapshotFieldName],
            readDeniedFieldNames: resolveReadDeniedFieldNames({
              subjectRecord: record,
              snapshotField,
              ...context,
            }),
          }),
        ]),
    ),
  };
};

const omitFromDiffSnapshots = ({
  diff,
  subjectRecord,
  snapshotFields,
  ...context
}: SnapshotRedactionContext & {
  diff: unknown;
  subjectRecord: unknown;
}): unknown => {
  if (!isPlainObject(diff)) {
    return diff;
  }

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
  objectMetadataId,
  objectsPermissions,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  objectMetadataId: string;
  objectsPermissions: ObjectsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TEvent => {
  const eventWithoutRestrictedFields = omitRestrictedFieldsFromEvent({
    event,
    restrictedFields: objectsPermissions[objectMetadataId]?.restrictedFields,
    flatFieldMetadataMaps,
  });

  const snapshotFields = resolveFieldValueSnapshotFields({
    objectMetadataId,
    flatFieldMetadataMaps,
  });

  if (snapshotFields.length === 0) {
    return eventWithoutRestrictedFields;
  }

  const context = { snapshotFields, objectsPermissions, flatFieldMetadataMaps };

  const properties: Record<string, unknown> = {
    ...eventWithoutRestrictedFields.properties,
  };

  return {
    ...eventWithoutRestrictedFields,
    properties: {
      ...properties,
      ...('before' in properties && {
        before: omitFromRecordSnapshots({
          record: properties.before,
          ...context,
        }),
      }),
      ...('after' in properties && {
        after: omitFromRecordSnapshots({ record: properties.after, ...context }),
      }),
      ...('diff' in properties && {
        diff: omitFromDiffSnapshots({
          diff: properties.diff,
          subjectRecord: properties.after ?? properties.before,
          ...context,
        }),
      }),
    },
  };
};
