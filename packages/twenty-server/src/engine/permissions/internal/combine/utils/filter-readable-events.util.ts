import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/internal/masking/utils/is-update-of-hidden-fields-only.util';
import { omitUnreadableFieldsFromEvent } from 'src/engine/permissions/internal/masking/utils/omit-unreadable-fields-from-event.util';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const filterReadableEvents = <TEvent extends ObjectRecordEvent>({
  events,
  readableRecordIds,
  principals,
  objectMetadata,
  recordsPermissions,
  metadataMaps,
  rlsRuleFilterByRoleId,
}: {
  events: TEvent[];
  readableRecordIds: Set<string>;
  principals: PermissionsPrincipalsWithRolesContext;
  objectMetadata: FlatObjectMetadata;
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  metadataMaps: PermissionsMetadataMaps;
  rlsRuleFilterByRoleId: Map<string, RecordGqlOperationFilter | null>;
}): TEvent[] => {
  const recordReadRestrictions = buildRecordReadRestrictions({
    recordsPermissions,
  });

  return events
    .filter((event) => readableRecordIds.has(event.recordId))
    .map((event) =>
      omitUnreadableFieldsFromEvent({
        event,
        principals,
        objectMetadata,
        recordsPermissions,
        recordReadRestrictions,
        metadataMaps,
        rlsRuleFilterByRoleId,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
