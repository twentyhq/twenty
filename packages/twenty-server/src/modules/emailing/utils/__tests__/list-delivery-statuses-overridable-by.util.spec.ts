import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { listDeliveryStatusesOverridableBy } from 'src/modules/emailing/utils/list-delivery-statuses-overridable-by.util';

describe('listDeliveryStatusesOverridableBy', () => {
  it('should let a complaint override every other outcome', () => {
    const overridable = listDeliveryStatusesOverridableBy(
      CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
    );

    expect(overridable).toContain(CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED);
    expect(overridable).toContain(CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED);
    expect(overridable).not.toContain(
      CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
    );
  });

  it('should not let a delivery override a bounce', () => {
    const overridable = listDeliveryStatusesOverridableBy(
      CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
    );

    expect(overridable).not.toContain(CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED);
    expect(overridable).toContain(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT);
  });

  it('should let nothing override a queued message except later outcomes', () => {
    const overridable = listDeliveryStatusesOverridableBy(
      CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED,
    );

    expect(overridable).toEqual([]);
  });

  it('should let a bounce override an in-flight send', () => {
    const overridable = listDeliveryStatusesOverridableBy(
      CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
    );

    expect(overridable).toContain(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING);
  });
});
