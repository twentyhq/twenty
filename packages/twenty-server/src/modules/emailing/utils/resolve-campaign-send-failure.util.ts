import { assertUnreachable } from 'twenty-shared/utils';

import {
  CAMPAIGN_MESSAGE_DELIVERY_STATUS,
  type CampaignMessageDeliveryStatus,
} from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';

type CampaignSendFailure = {
  deliveryStatus: CampaignMessageDeliveryStatus;
  shouldRetry: boolean;
};

export const resolveCampaignSendFailure = (
  error: unknown,
): CampaignSendFailure => {
  if (!(error instanceof EmailingDomainDriverException)) {
    return {
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      shouldRetry: true,
    };
  }

  switch (error.code) {
    case EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED:
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
        shouldRetry: false,
      };
    case EmailingDomainDriverExceptionCode.TEMPORARY_ERROR:
    case EmailingDomainDriverExceptionCode.UNKNOWN:
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        shouldRetry: true,
      };
    case EmailingDomainDriverExceptionCode.NOT_FOUND:
    case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
    case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
    case EmailingDomainDriverExceptionCode.SENDING_SUSPENDED:
    case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY:
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        shouldRetry: false,
      };
    default:
      return assertUnreachable(error.code);
  }
};
