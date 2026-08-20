import { MessageCampaignStatus } from 'twenty-shared/types';

import { computeCampaignTerminalStatus } from 'src/modules/emailing/utils/compute-campaign-terminal-status.util';

describe('computeCampaignTerminalStatus', () => {
  it.each([
    { failedCount: 0, skippedCount: 0 },
    { failedCount: 1, skippedCount: 0 },
    { failedCount: 0, skippedCount: 1 },
    { failedCount: 1, skippedCount: 1 },
  ])(
    'should return undefined while a message is still queued (failed: $failedCount, skipped: $skippedCount)',
    ({ failedCount, skippedCount }) => {
      expect(
        computeCampaignTerminalStatus({
          totalCount: 10,
          inProgressCount: 1,
          failedCount,
          skippedCount,
        }),
      ).toBeUndefined();
    },
  );

  it('should return SENT when every message succeeded', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 10,
        inProgressCount: 0,
        failedCount: 0,
        skippedCount: 0,
      }),
    ).toBe(MessageCampaignStatus.SENT);
  });

  it('should return SENT_WITH_ERRORS when a message failed', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 10,
        inProgressCount: 0,
        failedCount: 3,
        skippedCount: 0,
      }),
    ).toBe(MessageCampaignStatus.SENT_WITH_ERRORS);
  });

  it('should return SENT_WITH_ERRORS when a message was skipped', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 10,
        inProgressCount: 0,
        failedCount: 0,
        skippedCount: 3,
      }),
    ).toBe(MessageCampaignStatus.SENT_WITH_ERRORS);
  });

  it('should return SENT_WITH_ERRORS when messages both failed and were skipped', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 10,
        inProgressCount: 0,
        failedCount: 2,
        skippedCount: 5,
      }),
    ).toBe(MessageCampaignStatus.SENT_WITH_ERRORS);
  });

  it('should return SENT when the campaign has no message at all', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 10,
        inProgressCount: 0,
        failedCount: 0,
        skippedCount: 0,
      }),
    ).toBe(MessageCampaignStatus.SENT);
  });

  it('should not report a clean send when every recipient was filtered out before materialization', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 0,
        inProgressCount: 0,
        failedCount: 0,
        skippedCount: 0,
      }),
    ).toBe(MessageCampaignStatus.SENT_WITH_ERRORS);
  });

  it('should stay unfinished while a message is claimed but not yet resolved', () => {
    expect(
      computeCampaignTerminalStatus({
        totalCount: 10,
        inProgressCount: 1,
        failedCount: 0,
        skippedCount: 0,
      }),
    ).toBeUndefined();
  });
});
