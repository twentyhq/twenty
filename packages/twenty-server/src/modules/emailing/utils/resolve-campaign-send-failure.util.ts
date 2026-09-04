import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { type CampaignDeliveryState } from 'src/engine/core-modules/emailing-domain/types/campaign-delivery-state.type';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { type CampaignFailureReason } from 'src/engine/core-modules/emailing-domain/types/campaign-failure-reason.type';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { type CampaignSkipReason } from 'src/engine/core-modules/emailing-domain/types/campaign-skip-reason.type';
import { assertUnreachable } from 'twenty-shared/utils';

type CampaignSendFailure = {
  state: CampaignDeliveryState;
  skipReason: CampaignSkipReason | null;
  failureReason: CampaignFailureReason | null;
  shouldRetry: boolean;
};

export const resolveCampaignSendFailure = (
  error: unknown,
): CampaignSendFailure => {
  if (!(error instanceof EmailingDomainDriverException)) {
    return {
      state: CAMPAIGN_DELIVERY_STATE.FAILED,
      skipReason: null,
      failureReason: CAMPAIGN_FAILURE_REASON.UNKNOWN,
      shouldRetry: true,
    };
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
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.TEMPORARY_ERROR,
        shouldRetry: true,
      };
    case EmailingDomainDriverExceptionCode.UNKNOWN:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.UNKNOWN,
        shouldRetry: true,
      };
    case EmailingDomainDriverExceptionCode.SENDING_SUSPENDED:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.SENDING_SUSPENDED,
        shouldRetry: true,
      };
    case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.UNSUBSCRIBE_NOT_READY,
        shouldRetry: true,
      };
    case EmailingDomainDriverExceptionCode.NOT_FOUND:
    case EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.CONFIGURATION_ERROR,
        shouldRetry: false,
      };
    case EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.INSUFFICIENT_PERMISSIONS,
        shouldRetry: false,
      };
    case EmailingDomainDriverExceptionCode.SANDBOX_ACCOUNT:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.SANDBOX_ACCOUNT,
        shouldRetry: false,
      };
    case EmailingDomainDriverExceptionCode.UNSUBSCRIBE_MULTIPLE_RECIPIENTS:
      return {
        state: CAMPAIGN_DELIVERY_STATE.FAILED,
        skipReason: null,
        failureReason: CAMPAIGN_FAILURE_REASON.UNSUBSCRIBE_MULTIPLE_RECIPIENTS,
        shouldRetry: false,
      };
    default: {
      return assertUnreachable(error.code);
    }
  }
};
