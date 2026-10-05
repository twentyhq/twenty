import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { CAMPAIGN_DELIVERY_STATE } from 'src/engine/core-modules/emailing-domain/constants/campaign-delivery-state.constant';
import { CAMPAIGN_FAILURE_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-failure-reason.constant';
import { CAMPAIGN_SKIP_REASON } from 'src/engine/core-modules/emailing-domain/constants/campaign-skip-reason.constant';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';

const driverException = (code: EmailingDomainDriverExceptionCode) =>
  new EmailingDomainDriverException('failure', code);

describe('resolveCampaignSendFailure', () => {
  it('should retry a failure that did not come from the driver', () => {
    const failure = resolveCampaignSendFailure(new Error('socket hang up'));

    expect(failure.state).toBe(CAMPAIGN_DELIVERY_STATE.FAILED);
    expect(failure.failureReason).toBe(CAMPAIGN_FAILURE_REASON.UNKNOWN);
    expect(failure.shouldRetry).toBe(true);
  });

  it('should skip a message whose recipients are all suppressed without retrying', () => {
    const failure = resolveCampaignSendFailure(
      driverException(
        EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED,
      ),
    );

    expect(failure.state).toBe(CAMPAIGN_DELIVERY_STATE.SKIPPED);
    expect(failure.skipReason).toBe(CAMPAIGN_SKIP_REASON.SUPPRESSED);
    expect(failure.shouldRetry).toBe(false);
  });

  it('should retry a temporary driver error', () => {
    const failure = resolveCampaignSendFailure(
      driverException(EmailingDomainDriverExceptionCode.TEMPORARY_ERROR),
    );

    expect(failure.failureReason).toBe(CAMPAIGN_FAILURE_REASON.TEMPORARY_ERROR);
    expect(failure.shouldRetry).toBe(true);
  });

  it('should keep a misconfiguration distinguishable from an unknown failure', () => {
    const configuration = resolveCampaignSendFailure(
      driverException(EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR),
    );
    const permissions = resolveCampaignSendFailure(
      driverException(
        EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      ),
    );

    expect(configuration.failureReason).toBe(
      CAMPAIGN_FAILURE_REASON.CONFIGURATION_ERROR,
    );
    expect(permissions.failureReason).toBe(
      CAMPAIGN_FAILURE_REASON.INSUFFICIENT_PERMISSIONS,
    );
    expect(configuration.shouldRetry).toBe(false);
    expect(permissions.shouldRetry).toBe(false);
  });
});
