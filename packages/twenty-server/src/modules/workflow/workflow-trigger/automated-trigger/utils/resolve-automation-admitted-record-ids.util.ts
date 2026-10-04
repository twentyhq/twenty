import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';

import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { type RecordAccessPolicyService } from 'src/engine/core-modules/record-share/services/record-access-policy.service';
import { buildRoleRowAccessPolicySubject } from 'src/engine/core-modules/record-share/utils/build-role-row-access-policy-subject.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

// The records of an event batch that automations may react to
export const resolveAutomationAdmittedRecordIds = async ({
  payload,
  workspaceCacheService,
  recordAccessPolicyService,
}: {
  payload: WorkspaceEventBatch<ObjectRecordEvent>;
  workspaceCacheService: WorkspaceCacheService;
  recordAccessPolicyService: RecordAccessPolicyService;
}): Promise<Set<string>> => {
  const {
    flatApplicationMaps,
    flatRoleMaps,
    rolesPermissions,
    roleIdsWithAllRecordsAccess,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
  } = await workspaceCacheService.getOrRecompute(payload.workspaceId, [
    'flatApplicationMaps',
    'flatRoleMaps',
    'rolesPermissions',
    'roleIdsWithAllRecordsAccess',
    'flatRowLevelPermissionPredicateMaps',
    'flatRowLevelPermissionPredicateGroupMaps',
    'flatFieldMetadataMaps',
  ]);

  const standardApplication = findActiveFlatApplicationByUniversalIdentifier(
    flatApplicationMaps,
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  );

  return recordAccessPolicyService
    .buildEventRecordAccessGate(payload)
    .resolveAdmittedRecordIds(
      buildRoleRowAccessPolicySubject({
        roleId:
          standardApplication?.defaultRoleId ??
          findFlatEntityByUniversalIdentifier({
            flatEntityMaps: flatRoleMaps,
            universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
          })?.id,
        owningApplicationId: standardApplication?.id,
        rolesPermissions,
        roleIdsWithAllRecordsAccess,
        flatRowLevelPermissionPredicateMaps,
        flatRowLevelPermissionPredicateGroupMaps,
        flatFieldMetadataMaps,
      }),
    );
};
