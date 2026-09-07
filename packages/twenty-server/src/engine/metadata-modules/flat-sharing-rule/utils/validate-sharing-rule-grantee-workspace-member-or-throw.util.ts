import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  SharingRuleException,
  SharingRuleExceptionCode,
} from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';
import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';

// recordShare.principalId has no foreign key, so a stale member id would
// otherwise survive the migration and materialize rows nobody can hold
export const validateSharingRuleGranteeWorkspaceMemberOrThrow = ({
  granteePrincipalType,
  granteePrincipalId,
  flatWorkspaceMemberMaps,
}: {
  granteePrincipalType: RecordSharePrincipalType;
  granteePrincipalId: string | null;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
}): void => {
  if (
    granteePrincipalType !== RecordSharePrincipalType.WORKSPACE_MEMBER ||
    !isDefined(granteePrincipalId)
  ) {
    return;
  }

  if (!isDefined(flatWorkspaceMemberMaps.byId[granteePrincipalId])) {
    throw new SharingRuleException(
      `Workspace member ${granteePrincipalId} not found`,
      SharingRuleExceptionCode.WORKSPACE_MEMBER_NOT_FOUND,
    );
  }
};
