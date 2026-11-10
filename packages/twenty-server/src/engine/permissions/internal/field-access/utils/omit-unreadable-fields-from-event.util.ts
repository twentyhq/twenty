import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type FieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/fields-hidden-on-matching-records.type';
import { composeRecordFieldMetadataIds } from 'src/engine/permissions/internal/field-access/utils/compose-record-field-metadata-ids.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { filterFieldNamesInEventProperties } from 'src/engine/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/permissions/utils/get-field-names-in-event-properties.util';
import { omitRestrictedFieldsFromTimelineActivityEvent } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity-event.util';

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
  recordReadRestrictions,
  metadataMaps,
  fieldsHiddenOnMatchingRecords,
}: {
  event: TEvent;
  objectMetadata: FlatObjectMetadata;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  recordReadRestrictions: RecordReadRestrictions;
  metadataMaps: PermissionsMetadataMaps;
  fieldsHiddenOnMatchingRecords: FieldsHiddenOnMatchingRecords[];
}): TEvent => {
  const { properties } = event;
  const unreadableFieldNames = new Set(
    [
      ...composeRecordFieldMetadataIds({
        flatObjectMetadata: objectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        objectFieldMetadataIds:
          recordsPermissions.objects[objectMetadata.id]?.unreadableFields ?? [],
        // A record leaving an RLS rule still shows unreadable values in its before state
        records: [
          'before' in properties ? properties.before : undefined,
          'after' in properties ? properties.after : undefined,
        ].filter(isDefined),
        fieldsHiddenOnMatchingRecords,
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
  const eventWithoutUnreadableFields = omitFieldNamesFromEvent({
    event,
    fieldNames: unreadableFieldNames,
  });

  if (objectMetadata.nameSingular !== 'timelineActivity') {
    return eventWithoutUnreadableFields;
  }

  return omitRestrictedFieldsFromTimelineActivityEvent({
    event: eventWithoutUnreadableFields,
    recordReadRestrictions,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
  });
};
