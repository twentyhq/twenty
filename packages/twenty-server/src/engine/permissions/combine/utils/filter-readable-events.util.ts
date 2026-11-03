import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissions } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/masking/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/permissions/masking/utils/omit-restricted-fields-from-event.util';

export const filterReadableEvents = <TEvent extends ObjectRecordEvent>({
  events,
  admittedRecordIds,
  objectMetadata,
  objectsPermissions,
  metadataMaps,
}: {
  events: TEvent[];
  admittedRecordIds: Set<string>;
  objectMetadata: Pick<FlatObjectMetadata, 'id' | 'nameSingular'>;
  objectsPermissions: ObjectsPermissions;
  metadataMaps: Pick<
    PermissionsMetadataMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >;
}): TEvent[] =>
  events
    .filter((event) => admittedRecordIds.has(event.recordId))
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
