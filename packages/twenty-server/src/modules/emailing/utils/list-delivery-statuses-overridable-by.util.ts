import { CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY } from 'src/engine/core-modules/emailing-domain/constants/campaign-message-delivery-status-severity.constant';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';

export const listDeliveryStatusesOverridableBy = (
  incomingDeliveryStatus: CampaignMessageDeliveryStatus,
): CampaignMessageDeliveryStatus[] => {
  const incomingSeverity =
    CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY[incomingDeliveryStatus];

  return Object.entries(CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY)
    .filter(([, severity]) => severity < incomingSeverity)
    .map(([status]) => status as CampaignMessageDeliveryStatus);
};
