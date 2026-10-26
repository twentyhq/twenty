import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectsPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { filterFieldNamesInEventProperties } from 'src/engine/metadata-modules/permissions/utils/filter-field-names-in-event-properties.util';
import { getFieldNamesInEventProperties } from 'src/engine/metadata-modules/permissions/utils/get-field-names-in-event-properties.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { omitRestrictedFieldsFromTimelineActivityEvent } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity-event.util';

const buildRestrictedFieldNames = ({
  restrictedFields,
  flatFieldMetadataMaps,
}: {
  restrictedFields: RestrictedFieldsPermissions;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
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
  objectsPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  event: TEvent;
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TEvent => {
  const restrictedFields =
    objectsPermissions[objectMetadata.id]?.restrictedFields;

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
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      })
    : eventWithoutRestrictedFields;
};
