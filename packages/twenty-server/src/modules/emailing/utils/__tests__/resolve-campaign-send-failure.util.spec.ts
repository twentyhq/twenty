import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { resolveCampaignSendFailure } from 'src/modules/emailing/utils/resolve-campaign-send-failure.util';

const driverException = (code: EmailingDomainDriverExceptionCode) =>
  new EmailingDomainDriverException('failure', code);

describe('resolveCampaignSendFailure', () => {
  it('should retry a failure that did not come from the driver', () => {
    expect(resolveCampaignSendFailure(new Error('socket hang up'))).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      shouldRetry: true,
    });
  });

  it('should skip a message whose recipients are all suppressed without retrying', () => {
    expect(
      resolveCampaignSendFailure(
        driverException(
          EmailingDomainDriverExceptionCode.ALL_RECIPIENTS_SUPPRESSED,
        ),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SKIPPED,
      shouldRetry: false,
    });
  });

  it.each([
    EmailingDomainDriverExceptionCode.TEMPORARY_ERROR,
    EmailingDomainDriverExceptionCode.UNKNOWN,
    EmailingDomainDriverExceptionCode.SENDING_SUSPENDED,
    EmailingDomainDriverExceptionCode.UNSUBSCRIBE_NOT_READY,
  ])('should retry after a self-healing failure: %s', (code) => {
    expect(resolveCampaignSendFailure(driverException(code))).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      shouldRetry: true,
    });
  });

  it.each([
    EmailingDomainDriverExceptionCode.NOT_FOUND,
    EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
  ])('should stop retrying a misconfiguration: %s', (code) => {
    expect(resolveCampaignSendFailure(driverException(code))).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.FAILED,
      shouldRetry: false,
    });
  });
});
