import { MessageChannelSyncStatus } from 'twenty-shared/types';

import { resolveOnboardingEmailDigestSyncState } from 'src/modules/onboarding-email-digest/utils/resolve-onboarding-email-digest-sync-state.util';

describe('resolveOnboardingEmailDigestSyncState', () => {
  it.each([
    [MessageChannelSyncStatus.ONGOING],
    [MessageChannelSyncStatus.NOT_SYNCED],
  ])('should report an ongoing import for %s', (syncStatus) => {
    expect(
      resolveOnboardingEmailDigestSyncState([
        MessageChannelSyncStatus.ACTIVE,
        syncStatus,
      ]),
    ).toBe('IMPORTING');
  });

  it('should report synced when every channel is active', () => {
    expect(
      resolveOnboardingEmailDigestSyncState([MessageChannelSyncStatus.ACTIVE]),
    ).toBe('SYNCED');
  });

  it('should report failed when no channel is importing or active', () => {
    expect(
      resolveOnboardingEmailDigestSyncState([
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        MessageChannelSyncStatus.FAILED_UNKNOWN,
      ]),
    ).toBe('FAILED');
  });
});
