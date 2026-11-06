import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type RestrictedFieldsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { filterFieldNamesInEventProperties } from 'src/engine/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/permissions/utils/get-field-names-in-event-properties.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { omitRestrictedFieldsFromTimelineActivityEvent } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity-event.util';

const buildRestrictedFieldNames = ({
  restrictedFields,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): Set<string> =>
  new Set(
    Object.entries(restrictedFields).flatMap(
      ([fieldMetadataId, permissions]) => {
        if (permissions.canRead !== false) {
          return [];
        }

        const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadataId,
          flatEntityMaps: flatFieldMetadataMaps,
        });

        return isDefined(flatFieldMetadata)
          ? getFieldNamesInEventProperties(flatFieldMetadata)
          : [];
      },
    ),
  );

const omitFieldNames = <TEvent extends ObjectRecordEvent>({
  event,
  restrictedFieldNames,
}: {
  event: TEvent;
  restrictedFieldNames: Set<string>;
}): TEvent => {
  if (restrictedFieldNames.size === 0) {
    return event;
  }

  return {
    ...event,
    properties: {
      ...event.properties,
      ...filterFieldNamesInEventProperties({
        properties: event.properties,
        isFieldNameKept: (fieldName) => !restrictedFieldNames.has(fieldName),
      }),
    },
  };
};

export const omitRestrictedFieldsFromEvent = <
  TEvent extends ObjectRecordEvent,
>({
  event,
  objectMetadata,
  recordsPermissions,
  recordReadRestrictions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  recordReadRestrictions: RecordReadRestrictions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): TEvent => {
  const restrictedFields =
    recordsPermissions.objects[objectMetadata.id]?.restrictedFields;

  const eventWithoutRestrictedFields = isDefined(restrictedFields)
    ? omitFieldNames({
        event,
        restrictedFieldNames: buildRestrictedFieldNames({
          restrictedFields,
          flatFieldMetadataMaps,
        }),
      })
    : event;

  return objectMetadata.nameSingular === 'timelineActivity'
    ? omitRestrictedFieldsFromTimelineActivityEvent({
        event: eventWithoutRestrictedFields,
        recordReadRestrictions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      })
    : eventWithoutRestrictedFields;
};
