import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { isDefined } from 'twenty-shared/utils';

import { findActiveFlatApplicationByUniversalIdentifier } from 'src/engine/core-modules/application/utils/find-active-flat-application-by-universal-identifier.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

export const resolveAutomationAdmittedRecordIds = async ({
  payload,
  workspaceCacheService,
  recordAccessPolicyService,
}: {
  payload: WorkspaceEventBatch<ObjectRecordEvent>;
  workspaceCacheService: WorkspaceCacheService;
  recordAccessPolicyService: RecordAccessPolicyService;
}): Promise<Set<string>> => {
  const { flatApplicationMaps, flatRoleMaps } =
    await workspaceCacheService.getOrRecompute(payload.workspaceId, [
      'flatApplicationMaps',
      'flatRoleMaps',
    ]);

  const roleId =
    findActiveFlatApplicationByUniversalIdentifier(
      flatApplicationMaps,
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    )?.defaultRoleId ??
    findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatRoleMaps,
      universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
    })?.id;

  if (!isDefined(roleId)) {
    return new Set();
  }

  return recordAccessPolicyService
    .buildEventRecordAccessGate(payload)
    .resolveAdmittedRecordIds({
      workspaceId: payload.workspaceId,
      intersectionOf: { applicationRoleId: roleId },
    });
};
