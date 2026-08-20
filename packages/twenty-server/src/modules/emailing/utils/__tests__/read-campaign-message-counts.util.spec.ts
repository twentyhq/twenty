import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { readCampaignMessageCounts } from 'src/modules/emailing/utils/read-campaign-message-counts.util';

describe('readCampaignMessageCounts', () => {
  it('should count a message claimed for sending as still in progress', () => {
    const counts = readCampaignMessageCounts(
      new Map([
        [CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, 9],
        [CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING, 1],
      ]),
    );

    expect(counts.inProgressCount).toBe(1);
    expect(counts.totalCount).toBe(10);
  });

  it('should add queued and claimed messages together', () => {
    const counts = readCampaignMessageCounts(
      new Map([
        [CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED, 4],
        [CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING, 2],
        [CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, 1],
      ]),
    );

    expect(counts.inProgressCount).toBe(6);
    expect(counts.totalCount).toBe(7);
  });

  it('should report zero for a status no message holds', () => {
    const counts = readCampaignMessageCounts(
      new Map([[CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT, 3]]),
    );

    expect(counts.inProgressCount).toBe(0);
    expect(counts.failedCount).toBe(0);
    expect(counts.skippedCount).toBe(0);
    expect(counts.sentCount).toBe(3);
  });
});
