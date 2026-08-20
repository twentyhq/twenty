import { CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY } from 'src/engine/core-modules/emailing-domain/constants/campaign-message-delivery-status-severity.constant';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';

export const listDeliveryStatusesOverridableBy = (
  incomingDeliveryStatus: CampaignMessageDeliveryStatus,
): CampaignMessageDeliveryStatus[] => {
  const incomingSeverity =
    CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY[incomingDeliveryStatus];

  const deliveryStatuses = Object.keys(
    CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY,
  ) as CampaignMessageDeliveryStatus[];

  return deliveryStatuses.filter(
    (deliveryStatus) =>
      CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY[deliveryStatus] <
      incomingSeverity,
  );
};
