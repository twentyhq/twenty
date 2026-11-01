import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import { type PermissionsEnvironment } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/permissions/masking/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/permissions/masking/utils/omit-restricted-fields-from-event.util';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalObjectsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principal-objects-permissions.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const resolveEventsReadableByRole = async <
  TEvent extends ObjectRecordEvent,
>({
  roleId,
  workspaceEventBatch,
  eventRecordAccessGate,
  environment,
}: {
  roleId: string | null;
  workspaceEventBatch: WorkspaceEventBatch<TEvent>;
  eventRecordAccessGate: EventRecordAccessGate;
  environment: PermissionsEnvironment;
}): Promise<TEvent[]> => {
  if (!isDefined(roleId) || !isDefined(environment.rolesPermissions[roleId])) {
    return [];
  }

  const principal: PermissionsPrincipal = {
    workspaceId: workspaceEventBatch.workspaceId,
    intersectionOf: { applicationRoleId: roleId },
  };
  const objectsPermissions = getPermissionsPrincipalObjectsPermissions({
    principal,
    environment,
  });
  const admittedRecordIds =
    await eventRecordAccessGate.resolveAdmittedRecordIds(principal);

  return workspaceEventBatch.events
    .filter((event) => admittedRecordIds.has(event.recordId))
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata: workspaceEventBatch.objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps: environment.flatObjectMetadataMaps,
        flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
