import { msg } from '@lingui/core/macro';
import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/record-share/record-share.exception';
import { type ShareWithInput } from 'src/engine/record-share/types/share-with-input.type';
import { resolveShareWithPrincipal } from 'src/engine/record-share/utils/resolve-share-with-principal.util';

export const validateShareWithPrincipalsOrThrow = ({
  shareWith,
  flatWorkspaceMemberMaps,
  flatRoleMaps,
}: {
  shareWith: ShareWithInput[];
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
  flatRoleMaps: FlatRoleMaps;
}): void => {
  for (const shareWithEntry of shareWith) {
    const { principalId, principalType } =
      resolveShareWithPrincipal(shareWithEntry);

    const flatWorkspaceMember = flatWorkspaceMemberMaps.byId[principalId];

    if (
      principalType === RecordSharePrincipalType.WORKSPACE_MEMBER &&
      (!isDefined(flatWorkspaceMember) ||
        isDefined(flatWorkspaceMember.deletedAt))
    ) {
      throw new RecordShareException(
        `shareWith names a workspace member that does not belong to this workspace: ${principalId}`,
        RecordShareExceptionCode.INVALID_SHARE_WITH,
        {
          userFriendlyMessage: msg`shareWith names a workspace member that does not belong to this workspace`,
        },
      );
    }

    if (
      principalType === RecordSharePrincipalType.ROLE &&
      !isDefined(flatRoleMaps.universalIdentifierById[principalId])
    ) {
      throw new RecordShareException(
        `shareWith names a role that does not belong to this workspace: ${principalId}`,
        RecordShareExceptionCode.INVALID_SHARE_WITH,
        {
          userFriendlyMessage: msg`shareWith names a role that does not belong to this workspace`,
        },
      );
    }
  }
};
