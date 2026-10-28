import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { omitHiddenFieldsFromEvents } from 'src/engine/metadata-modules/permissions/utils/omit-hidden-fields-from-events.util';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type ApplicationDefaultRoleMaps } from 'src/engine/twenty-orm/types/application-default-role-maps.type';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { computeObjectsPermissionsForRolePermissionConfig } from 'src/engine/twenty-orm/utils/compute-objects-permissions-for-role-permission-config.util';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const resolveEventsReadableByRole = async <
  TEvent extends ObjectRecordEvent,
>({
  intersectionOf,
  owningApplicationId,
  workspaceMember,
  workspaceEventBatch,
  eventRecordAccessGate,
  rolesPermissions,
  roleIdsWithAllRecordsAccess,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
  flatApplicationMaps,
}: {
  intersectionOf: RoleIdsBySource;
  owningApplicationId: string | undefined;
  workspaceMember?: UserWorkspaceAuthContext['workspaceMember'];
  workspaceEventBatch: WorkspaceEventBatch<TEvent>;
  eventRecordAccessGate: EventRecordAccessGate;
  rolesPermissions: ObjectsPermissionsByRoleId;
  roleIdsWithAllRecordsAccess: string[];
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatApplicationMaps: ApplicationDefaultRoleMaps;
}): Promise<TEvent[]> => {
  const roleIds = getRoleIdsToIntersect(intersectionOf);

  if (
    !isDefined(roleIds) ||
    !roleIds.every((roleId) => isDefined(rolesPermissions[roleId]))
  ) {
    return [];
  }

  const objectsPermissions = computeObjectsPermissionsForRolePermissionConfig({
    intersectionOf,
    rolesPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatApplicationMaps,
  });

  const admittedRecordIds =
    await eventRecordAccessGate.resolveAdmittedRecordIds(
      buildRoleRowAccessPolicySubject({
        roleIds,
        objectsPermissions,
        owningApplicationId,
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        workspaceMember,
      }),
    );

  return omitHiddenFieldsFromEvents({
    events: workspaceEventBatch.events.filter((event) =>
      admittedRecordIds.has(event.recordId),
    ),
    objectMetadata: workspaceEventBatch.objectMetadata,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
};
