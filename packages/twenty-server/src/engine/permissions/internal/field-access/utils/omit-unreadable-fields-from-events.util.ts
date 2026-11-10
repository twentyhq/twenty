import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/internal/field-access/utils/is-update-of-hidden-fields-only.util';
import { omitUnreadableFieldsFromEvent } from 'src/engine/permissions/internal/field-access/utils/omit-unreadable-fields-from-event.util';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { type RlsRuleFields } from 'src/engine/permissions/internal/field-access/types/rls-rule-fields.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const omitUnreadableFieldsFromEvents = <
  TEvent extends ObjectRecordEvent,
>({
  events,
  objectMetadata,
  recordsPermissions,
  metadataMaps,
  rlsRuleFields,
}: {
  events: TEvent[];
  objectMetadata: FlatObjectMetadata;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  metadataMaps: PermissionsMetadataMaps;
  rlsRuleFields: RlsRuleFields[];
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
        rlsRuleFields,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
