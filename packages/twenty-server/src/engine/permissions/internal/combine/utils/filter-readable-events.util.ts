import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/internal/masking/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/permissions/internal/masking/utils/omit-restricted-fields-from-event.util';
import { type RlsRuleUnreadableFields } from 'src/engine/permissions/internal/masking/types/rls-rule-unreadable-fields.type';
import { omitRlsRuleUnreadableFieldsFromEvent } from 'src/engine/permissions/internal/masking/utils/omit-rls-rule-unreadable-fields-from-event.util';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const filterReadableEvents = <TEvent extends ObjectRecordEvent>({
  events,
  readableRecordIds,
  objectMetadata,
  recordsPermissions,
  rlsRulesUnreadableFields,
  metadataMaps,
}: {
  events: TEvent[];
  readableRecordIds: Set<string>;
  objectMetadata: FlatObjectMetadata;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  rlsRulesUnreadableFields: RlsRuleUnreadableFields[];
  metadataMaps: Pick<
    PermissionsMetadataMaps,
    'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
  >;
}): TEvent[] => {
  const recordReadRestrictions = buildRecordReadRestrictions({
    recordsPermissions,
  });

  return events
    .filter((event) => readableRecordIds.has(event.recordId))
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event: omitRlsRuleUnreadableFieldsFromEvent({
          event,
          rlsRulesUnreadableFields,
          flatObjectMetadata: objectMetadata,
          flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        }),
        objectMetadata,
        recordsPermissions,
        recordReadRestrictions,
        flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
