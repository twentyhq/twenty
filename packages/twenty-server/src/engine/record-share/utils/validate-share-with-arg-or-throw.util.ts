import { msg } from '@lingui/core/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/record-share/record-share.exception';
import { type ShareWithInput } from 'src/engine/record-share/types/share-with-input.type';
import { resolveShareWithPrincipal } from 'src/engine/record-share/utils/resolve-share-with-principal.util';

export const validateShareWithArgOrThrow = ({
  authContext,
  isRecordSharingEnabled,
  shareWith,
}: {
  authContext: WorkspaceAuthContext;
  isRecordSharingEnabled: boolean;
  shareWith?: ShareWithInput[] | null;
}): void => {
  if (
    isRecordSharingEnabled &&
    !isUserAuthContext(authContext) &&
    !isNonEmptyArray(shareWith)
  ) {
    throw new RecordShareException(
      'Creating a record of a private object requires the shareWith argument',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      {
        userFriendlyMessage: msg`Creating a record of a private object requires the shareWith argument`,
      },
    );
  }

  const principalIds = (shareWith ?? []).map(
    (shareWithEntry) => resolveShareWithPrincipal(shareWithEntry).principalId,
  );

  if (new Set(principalIds).size !== principalIds.length) {
    throw new RecordShareException(
      'shareWith names the same principal more than once',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      {
        userFriendlyMessage: msg`shareWith names the same principal more than once`,
      },
    );
  }
};
