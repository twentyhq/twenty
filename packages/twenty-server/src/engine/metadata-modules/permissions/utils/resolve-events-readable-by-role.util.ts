import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EventRecordAccessGate } from 'src/engine/core-modules/record-share/types/event-record-access-gate.type';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { isUpdateOfHiddenFieldsOnly } from 'src/engine/core-modules/record-share/utils/is-update-of-hidden-fields-only.util';
import { omitRestrictedFieldsFromEvent } from 'src/engine/metadata-modules/permissions/utils/omit-restricted-fields-from-event.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

export const resolveEventsReadableByRole = async <
  TEvent extends ObjectRecordEvent,
>({
  roleId,
  owningApplicationId,
  workspaceEventBatch,
  eventRecordAccessGate,
  rolesPermissions,
  roleIdsWithAllRecordsAccess,
  flatRowLevelPermissionPredicateMaps,
  flatRowLevelPermissionPredicateGroupMaps,
  flatFieldMetadataMaps,
  flatObjectMetadataMaps,
}: {
  roleId: string | null;
  owningApplicationId: string;
  workspaceEventBatch: WorkspaceEventBatch<TEvent>;
  eventRecordAccessGate: EventRecordAccessGate;
  rolesPermissions: ObjectsPermissionsByRoleId;
  roleIdsWithAllRecordsAccess: string[];
  flatRowLevelPermissionPredicateMaps: FlatRowLevelPermissionPredicateMaps;
  flatRowLevelPermissionPredicateGroupMaps: FlatRowLevelPermissionPredicateGroupMaps;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): Promise<TEvent[]> => {
  const objectsPermissions = isDefined(roleId)
    ? rolesPermissions[roleId]
    : undefined;

  if (!isDefined(roleId) || !isDefined(objectsPermissions)) {
    return [];
  }

  const admittedRecordIds =
    await eventRecordAccessGate.resolveAdmittedRecordIds(
      buildRoleRowAccessPolicySubject({
        roleId,
        owningApplicationId,
        rolesPermissions,
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
      }),
    );
  return workspaceEventBatch.events
    .filter((event) => admittedRecordIds.has(event.recordId))
    .map((event) =>
      omitRestrictedFieldsFromEvent({
        event,
        objectMetadata: workspaceEventBatch.objectMetadata,
        objectsPermissions,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    )
    .filter((event) => !isUpdateOfHiddenFieldsOnly(event));
};
