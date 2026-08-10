import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { type OnboardingEmailDigestSyncState } from 'src/modules/onboarding-email-digest/types/onboarding-email-digest-sync-state.type';

export const resolveOnboardingEmailDigestSyncState = (
  syncStatuses: MessageChannelSyncStatus[],
): Exclude<OnboardingEmailDigestSyncState, 'NOT_CONNECTED'> => {
  const hasOngoingImport = syncStatuses.some(
    (syncStatus) =>
      syncStatus === MessageChannelSyncStatus.ONGOING ||
      syncStatus === MessageChannelSyncStatus.NOT_SYNCED,
  );

  if (hasOngoingImport) {
    return 'IMPORTING';
  }

  const hasActiveChannel = syncStatuses.some(
    (syncStatus) => syncStatus === MessageChannelSyncStatus.ACTIVE,
  );

  return hasActiveChannel ? 'SYNCED' : 'FAILED';
};
