import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

type BroadcastEventAudience = Pick<
  WorkspaceBroadcastEvent,
  'recipientUserWorkspaceIds' | 'excludedUserWorkspaceIds'
>;

export const computeRecipientsWhoLostAccess = ({
  recipientUserWorkspaceIdsBefore,
  recipientUserWorkspaceIdsAfter,
}: {
  recipientUserWorkspaceIdsBefore: string[] | undefined;
  recipientUserWorkspaceIdsAfter: string[] | undefined;
}): BroadcastEventAudience | undefined => {
  if (!isDefined(recipientUserWorkspaceIdsAfter)) {
    return undefined;
  }

  if (!isDefined(recipientUserWorkspaceIdsBefore)) {
    return { excludedUserWorkspaceIds: recipientUserWorkspaceIdsAfter };
  }

  const recipientUserWorkspaceIdsAfterSet = new Set(
    recipientUserWorkspaceIdsAfter,
  );
  const recipientUserWorkspaceIdsWhoLostAccess =
    recipientUserWorkspaceIdsBefore.filter(
      (userWorkspaceId) =>
        !recipientUserWorkspaceIdsAfterSet.has(userWorkspaceId),
    );

  return recipientUserWorkspaceIdsWhoLostAccess.length > 0
    ? { recipientUserWorkspaceIds: recipientUserWorkspaceIdsWhoLostAccess }
    : undefined;
};
