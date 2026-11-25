import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/internal/field-access/utils/is-update-of-hidden-fields-only.util';
import { omitUnreadableFieldsFromEvent } from 'src/engine/permissions/internal/field-access/utils/omit-unreadable-fields-from-event.util';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { type UnreadableFieldsOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/unreadable-fields-on-matching-records.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const omitUnreadableFieldsFromEvents = <
  TEvent extends ObjectRecordEvent,
>({
  events,
  objectMetadata,
  recordsPermissions,
  metadataMaps,
  unreadableFieldsOnMatchingRecords,
}: {
  events: TEvent[];
  objectMetadata: FlatObjectMetadata;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  metadataMaps: PermissionsMetadataMaps;
  unreadableFieldsOnMatchingRecords: UnreadableFieldsOnMatchingRecords[];
}): TEvent[] => {
  const recordReadRestrictions = buildRecordReadRestrictions({
    recordsPermissions,
  });

  return events
    .map((event) =>
      omitUnreadableFieldsFromEvent({
        event,
        objectMetadata,
        recordsPermissions,
        recordReadRestrictions,
        metadataMaps,
        unreadableFieldsOnMatchingRecords,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
