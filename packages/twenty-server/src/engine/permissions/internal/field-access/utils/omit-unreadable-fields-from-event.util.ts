import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { type UnreadableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/unreadable-fields-on-matching-records.type';
import { findUnreadableFieldMetadataIdsOnRecords } from 'src/engine/permissions/internal/field-access/utils/find-unreadable-field-metadata-ids-on-records.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { filterFieldNamesInEventProperties } from 'src/engine/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/permissions/utils/get-field-names-in-event-properties.util';

const omitFieldNamesFromEvent = <TEvent extends ObjectRecordEvent>({
  event,
  fieldNames,
}: {
  event: TEvent;
  fieldNames: Set<string>;
}): TEvent => {
  if (fieldNames.size === 0) {
    return event;
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      ...filterFieldNamesInEventProperties({
        properties: event.properties,
        isFieldNameKept: (fieldName) => !fieldNames.has(fieldName),
      }),
    },
  };
};

export const omitUnreadableFieldsFromEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  objectMetadata,
  recordsPermissions,
  metadataMaps,
  unreadableFieldsOnMatchingRecords,
}: {
  event: TEvent;
  objectMetadata: FlatObjectMetadata;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  metadataMaps: PermissionsMetadataMaps;
  unreadableFieldsOnMatchingRecords: UnreadableFieldsOnMatchingRecords[];
}): TEvent => {
  const { properties } = event;
  const unreadableFieldNames = new Set(
    [
      ...findUnreadableFieldMetadataIdsOnRecords({
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        flatFieldMetadataOptionMaps: metadataMaps.flatFieldMetadataOptionMaps,
        objectUnreadableFieldMetadataIds:
          recordsPermissions.objects[objectMetadata.id]?.unreadableFields ?? [],
        // A record leaving an RLS rule still shows unreadable values in its before state
        records: [
          'before' in properties ? properties.before : undefined,
          'after' in properties ? properties.after : undefined,
        ].filter(isDefined),
        unreadableFieldsOnMatchingRecords,
      }),
    ].flatMap((fieldMetadataId) => {
      const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: metadataMaps.flatFieldMetadataMaps,
      });

      return isDefined(flatFieldMetadata)
        ? getFieldNamesInEventProperties(flatFieldMetadata)
        : [];
    }),
  );
  return omitFieldNamesFromEvent({
    event,
    fieldNames: unreadableFieldNames,
  });
};
