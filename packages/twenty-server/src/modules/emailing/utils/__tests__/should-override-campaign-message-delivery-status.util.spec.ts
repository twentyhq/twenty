import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';
import { shouldOverrideCampaignMessageDeliveryStatus } from 'src/modules/emailing/utils/should-override-campaign-message-delivery-status.util';

const STATUSES_FROM_LEAST_TO_MOST_SEVERE: CampaignMessageDeliveryStatus[] = [
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.REJECTED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.RENDERING_FAILED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
  CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
];

describe('shouldOverrideCampaignMessageDeliveryStatus', () => {
  it('should override when the message has no delivery status yet', () => {
    expect(
      shouldOverrideCampaignMessageDeliveryStatus({
        currentDeliveryStatus: null,
        incomingDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
      }),
    ).toBe(true);
  });

  it('should record a delivery arriving after the send', () => {
    expect(
      shouldOverrideCampaignMessageDeliveryStatus({
        currentDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT,
        incomingDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
      }),
    ).toBe(true);
  });

  it('should not let a soft bounce overwrite a hard bounce', () => {
    expect(
      shouldOverrideCampaignMessageDeliveryStatus({
        currentDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
        incomingDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
      }),
    ).toBe(false);
  });

  it('should record a complaint arriving after a bounce', () => {
    expect(
      shouldOverrideCampaignMessageDeliveryStatus({
        currentDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
        incomingDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
      }),
    ).toBe(true);
  });

  it('should not downgrade a complaint to a bounce', () => {
    expect(
      shouldOverrideCampaignMessageDeliveryStatus({
        currentDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
        incomingDeliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
      }),
    ).toBe(false);
  });

  const orderingPairs = STATUSES_FROM_LEAST_TO_MOST_SEVERE.flatMap(
    (currentDeliveryStatus, currentIndex) =>
      STATUSES_FROM_LEAST_TO_MOST_SEVERE.map(
        (incomingDeliveryStatus, incomingIndex) => ({
          currentDeliveryStatus,
          incomingDeliveryStatus,
          expected: incomingIndex > currentIndex,
        }),
      ),
  );

  it.each(orderingPairs)(
    'should return $expected when $incomingDeliveryStatus arrives on $currentDeliveryStatus',
    ({ currentDeliveryStatus, incomingDeliveryStatus, expected }) => {
      expect(
        shouldOverrideCampaignMessageDeliveryStatus({
          currentDeliveryStatus,
          incomingDeliveryStatus,
        }),
      ).toBe(expected);
    },
  );
});
