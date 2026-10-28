import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { omitRestrictedFieldsFromEvent } from 'src/engine/metadata-modules/permissions/utils/omit-restricted-fields-from-event.util';
import { restrictObjectsPermissionsToDisabledActions } from 'src/engine/twenty-orm/utils/restrict-objects-permissions-to-disabled-actions.util';

const FULL_ACCESS_OBJECT_PERMISSIONS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

// Timeline activity payloads carry other objects' fields, so they need every object's permissions
const getObjectMetadataIdsToRestrict = ({
  objectMetadata,
  flatObjectMetadataMaps,
}: {
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): string[] =>
  objectMetadata.nameSingular === 'timelineActivity'
    ? Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map((flatObjectMetadata) => flatObjectMetadata.id)
    : [objectMetadata.id];

// A webhook has no role and no owning application, so only disabled actions restrict it
export const omitReadDisabledFieldsFromWebhookEvents = <
  TEvent extends ObjectRecordEvent,
>({
  events,
  objectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  events: TEvent[];
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): TEvent[] => {
  const objectsPermissions = restrictObjectsPermissionsToDisabledActions({
    objectsPermissions: Object.fromEntries(
      getObjectMetadataIdsToRestrict({
        objectMetadata,
        flatObjectMetadataMaps,
      }).map((objectMetadataId) => [
        objectMetadataId,
        FULL_ACCESS_OBJECT_PERMISSIONS,
      ]),
    ),
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    actingApplicationId: undefined,
  });

  return events
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
