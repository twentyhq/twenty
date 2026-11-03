import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/masking/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/permissions/masking/utils/omit-restricted-fields-from-event.util';
import { getPermissionsPrincipalObjectsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principal-objects-permissions.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveEventsReadableByRole = async <
  TEvent extends ObjectRecordEvent,
>({
  applicationId,
  roleId,
  workspaceEventBatch,
  eventRecordAccessGate,
  metadataMaps,
}: {
  applicationId: string;
  roleId: string | null;
  workspaceEventBatch: WorkspaceEventBatch<TEvent>;
  eventRecordAccessGate: EventRecordAccessGate;
  metadataMaps: PermissionsMetadataMaps;
}): Promise<TEvent[]> => {
  if (!isDefined(roleId) || !isDefined(metadataMaps.rolesPermissions[roleId])) {
    return [];
  }

  const principal: PermissionsPrincipalsWithRolesContext = {
    workspaceId: workspaceEventBatch.workspaceId,
    mainPrincipal: { type: 'application', roleId, applicationId },
    applicationPrincipal: { type: 'application', roleId, applicationId },
  };
  const objectsPermissions = getPermissionsPrincipalObjectsPermissions({
    principal,
    metadataMaps,
  });
  const admittedRecordIds =
    await eventRecordAccessGate.resolveAdmittedRecordIds({
      workspaceId: workspaceEventBatch.workspaceId,
      mainPrincipal: { type: 'application', applicationId },
      applicationPrincipal: { type: 'application', applicationId },
    });

  return workspaceEventBatch.events
    .filter((event) => admittedRecordIds.has(event.recordId))
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata: workspaceEventBatch.objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
