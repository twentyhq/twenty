import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { omitRestrictedFieldsFromEvent } from 'src/engine/core-modules/record-share/utils/omit-restricted-fields-from-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildReadDeniedFieldNamesAcrossObjects } from 'src/engine/metadata-modules/permissions/utils/build-read-denied-field-names-across-objects.util';
import { omitReadDeniedFieldsFromFieldValueSnapshot } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-field-value-snapshot.util';
import { resolveFieldValueSnapshotFieldNames } from 'src/engine/metadata-modules/permissions/utils/resolve-field-value-snapshot-field-names.util';

const omitFromSnapshotFields = ({
  record,
  snapshotFieldNames,
  readDeniedFieldNames,
}: {
  record: unknown;
  snapshotFieldNames: string[];
  readDeniedFieldNames: Set<string>;
}): unknown =>
  isPlainObject(record)
    ? {
        ...record,
        ...Object.fromEntries(
          snapshotFieldNames
            .filter((fieldName) => fieldName in record)
            .map((fieldName) => [
              fieldName,
              omitReadDeniedFieldsFromFieldValueSnapshot({
                snapshot: record[fieldName],
                readDeniedFieldNames,
              }),
            ]),
        ),
      }
    : record;

const omitFromSnapshotFieldDiffs = ({
  diff,
  snapshotFieldNames,
  readDeniedFieldNames,
}: {
  diff: unknown;
  snapshotFieldNames: string[];
  readDeniedFieldNames: Set<string>;
}): unknown => {
  if (!isPlainObject(diff)) {
    return diff;
  }

  const snapshotFieldDiffs = snapshotFieldNames.flatMap((fieldName) => {
    const fieldDiff = diff[fieldName];

    if (!isPlainObject(fieldDiff)) {
      return [];
    }

    return [
      [
        fieldName,
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

  const snapshotFieldNames = resolveFieldValueSnapshotFieldNames({
    objectMetadataId,
    flatFieldMetadataMaps,
  });

  if (snapshotFieldNames.length === 0) {
    return eventWithoutRestrictedFields;
  }

  const readDeniedFieldNames = buildReadDeniedFieldNamesAcrossObjects({
    objectsPermissions,
    flatFieldMetadataMaps,
  });

  if (readDeniedFieldNames.size === 0) {
    return eventWithoutRestrictedFields;
  }

  const properties: Record<string, unknown> = {
    ...eventWithoutRestrictedFields.properties,
  };

  return {
    ...eventWithoutRestrictedFields,
    properties: {
      ...properties,
      ...('before' in properties && {
        before: omitFromSnapshotFields({
          record: properties.before,
          snapshotFieldNames,
          readDeniedFieldNames,
        }),
      }),
      ...('after' in properties && {
        after: omitFromSnapshotFields({
          record: properties.after,
          snapshotFieldNames,
          readDeniedFieldNames,
        }),
      }),
      ...('diff' in properties && {
        diff: omitFromSnapshotFieldDiffs({
          diff: properties.diff,
          snapshotFieldNames,
          readDeniedFieldNames,
        }),
      }),
    },
  };
};
