import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { type CampaignMessageDeliveryStatus } from 'src/engine/core-modules/emailing-domain/types/campaign-message-delivery-status.type';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { assertUnreachable } from 'twenty-shared/utils';

export const resolveCampaignSendFailure = (
  error: unknown,
): {
  deliveryStatus: CampaignMessageDeliveryStatus;
  shouldRetry: boolean;
} => {
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
    case EmailingDomainDriverExceptionCode.SENDING_SUSPENDED:
    case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY:
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        shouldRetry: true,
      };
    case EmailingDomainDriverExceptionCode.NOT_FOUND:
    case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
    case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
    case EmailingDomainDriverExceptionCode.SANDBOX_ACCOUNT:
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
        shouldRetry: false,
      };
    default:
      return assertUnreachable(error.code);
  }
};
