import { isDefined } from 'twenty-shared/utils';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY } from 'src/engine/core-modules/emailing-domain/constants/campaign-message-delivery-status-severity.constant';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';

export const shouldOverrideCampaignMessageDeliveryStatus = ({
  currentDeliveryStatus,
  incomingDeliveryStatus,
}: {
  currentDeliveryStatus: CampaignMessageDeliveryStatus | null;
  incomingDeliveryStatus: CampaignMessageDeliveryStatus;
}): boolean => {
  if (!isDefined(currentDeliveryStatus)) {
    return true;
  }

  return (
    CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY[incomingDeliveryStatus] >
    CAMPAIGN_MESSAGE_DELIVERY_STATUS_SEVERITY[currentDeliveryStatus]
  );
};
