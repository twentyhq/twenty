import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import {
  CAMPAIGN_DELIVERY_STATE,
  type CampaignDeliveryState,
} from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';
import {
  CAMPAIGN_FAILURE_REASON,
  type CampaignFailureReason,
} from 'src/engine/core-modules/emailing-domain/types/campaign-failure-reason.type';
import {
  CAMPAIGN_SKIP_REASON,
  type CampaignSkipReason,
} from 'src/engine/core-modules/emailing-domain/types/campaign-skip-reason.type';
import { assertUnreachable } from 'twenty-shared/utils';

type CampaignSendFailure = {
  state: CampaignDeliveryState;
  skipReason: CampaignSkipReason | null;
  failureReason: CampaignFailureReason | null;
  shouldRetry: boolean;
};

const failed = (
  failureReason: CampaignFailureReason,
  shouldRetry: boolean,
): CampaignSendFailure => ({
  state: CAMPAIGN_DELIVERY_STATE.FAILED,
  skipReason: null,
  failureReason,
  shouldRetry,
});

export const resolveCampaignSendFailure = (
  error: unknown,
): CampaignSendFailure => {
  if (!(error instanceof EmailingDomainDriverException)) {
    return failed(CAMPAIGN_FAILURE_REASON.UNKNOWN, true);
  }

  switch (error.code) {
    case EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED:
      return {
        state: CAMPAIGN_DELIVERY_STATE.SKIPPED,
        skipReason: CAMPAIGN_SKIP_REASON.SUPPRESSED,
        failureReason: null,
        shouldRetry: false,
      };
    case EmailingDomainDriverExceptionCode.TEMPORARY_ERROR:
      return failed(CAMPAIGN_FAILURE_REASON.TEMPORARY_ERROR, true);
    case EmailingDomainDriverExceptionCode.UNKNOWN:
      return failed(CAMPAIGN_FAILURE_REASON.UNKNOWN, true);
    case EmailingDomainDriverExceptionCode.SENDING_SUSPENDED:
      return failed(CAMPAIGN_FAILURE_REASON.SENDING_SUSPENDED, true);
    case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY:
      return failed(CAMPAIGN_FAILURE_REASON.UNSUBSCRIBE_NOT_READY, true);
    case EmailingDomainDriverExceptionCode.NOT_FOUND:
      return failed(CAMPAIGN_FAILURE_REASON.CONFIGURATION_ERROR, false);
    case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
      return failed(CAMPAIGN_FAILURE_REASON.INSUFFICIENT_PERMISSIONS, false);
    case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
      return failed(CAMPAIGN_FAILURE_REASON.CONFIGURATION_ERROR, false);
    default:
      return assertUnreachable(error.code);
  }
};
