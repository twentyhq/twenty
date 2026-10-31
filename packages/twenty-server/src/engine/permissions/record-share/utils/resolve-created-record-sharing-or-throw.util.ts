/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type ShareWithInput } from 'src/engine/permissions/record-share/types/share-with-input.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';
import { type ObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';

export type CreatedRecordSharing = {
  shareWith: ShareWithInput[];
  isPrivate: boolean;
};

// shareWith also reaches records created through nested relations, whose objects may not be shareable
export const resolveCreatedRecordSharingOrThrow = ({
  objectSharing: { isShareable, isShareRequired, isPrivateByDefault },
  shareWith,
}: {
  objectSharing: Pick<
    ObjectSharing,
    'isShareable' | 'isShareRequired' | 'isPrivateByDefault'
  >;
  shareWith?: ShareWithInput[] | null;
}): CreatedRecordSharing | null => {
  if (!isShareable) {
    return null;
  }

  const entries = shareWith ?? [];

  if (
    (isShareRequired || isPrivateByDefault) &&
    entries.some(
      (entry) =>
        entry.everyone && entry.accessLevel !== RecordShareAccessLevel.NONE,
    )
  ) {
    throw new RecordShareException(
      'Records of this object are always private',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      { userFriendlyMessage: msg`This record can only be private.` },
    );
  }

  if (isShareRequired) {
    return {
      shareWith: entries.filter((entry) => !entry.everyone),
      isPrivate: false,
    };
  }

  const everyoneEntries = entries.filter((entry) => entry.everyone);

  if (
    everyoneEntries.some(
      (entry) => entry.accessLevel === RecordShareAccessLevel.READ,
    )
  ) {
    throw new RecordShareException(
      'A record is either private or follows the roles of its object',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
      { userFriendlyMessage: msg`Invalid access level.` },
    );
  }

  const namedEntries = entries.filter((entry) => !entry.everyone);
  const isPrivate =
    isPrivateByDefault ||
    everyoneEntries.some(
      (entry) => entry.accessLevel === RecordShareAccessLevel.NONE,
    );

  return isPrivate || isNonEmptyArray(namedEntries)
    ? { shareWith: namedEntries, isPrivate }
    : null;
};
