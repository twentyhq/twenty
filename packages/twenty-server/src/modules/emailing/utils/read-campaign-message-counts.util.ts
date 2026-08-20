import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';

export const readCampaignMessageCounts = (
  countByDeliveryStatus: Map<string, number>,
) => {
  const countOf = (deliveryStatus: string) =>
    countByDeliveryStatus.get(deliveryStatus) ?? 0;

  return {
    totalCount: [...countByDeliveryStatus.values()].reduce(
      (total, count) => total + count,
      0,
    ),
    inProgressCount:
      countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.QUEUED) +
      countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENDING),
    sentCount: countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SENT),
    failedCount:
      countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED) +
      countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.REJECTED) +
      countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.RENDERING_FAILED),
    skippedCount: countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED),
    bouncedCount: countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED),
    complainedCount: countOf(CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED),
  };
};
