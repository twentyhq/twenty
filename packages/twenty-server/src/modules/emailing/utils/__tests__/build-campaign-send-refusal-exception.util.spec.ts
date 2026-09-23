import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildCampaignSendRefusalException } from 'src/modules/emailing/utils/build-campaign-send-refusal-exception.util';

const buildException = (sendRefusal: UsageRefusal) =>
  buildCampaignSendRefusalException({
    campaignId: 'campaign-1',
    recipientCount: 12,
    sendRefusal,
  });

const QUOTA_EXHAUSTED: UsageRefusal = {
  kind: 'quotaExhausted',
  exhaustedScope: {
    resourceType: UsageResourceType.EMAIL,
    limitKind: 'quota',
    exhaustedKind: 'limit',
    spenderType: 'userWorkspace',
    spenderId: 'user-workspace-1',
    operationType: UsageOperationType.EMAIL_SEND,
    limitValue: 1000,
    remaining: 0,
    periodCount: 1,
    periodUnit: 'month',
    retryAfterMs: 0,
  },
};

describe('buildCampaignSendRefusalException', () => {
  it('advises topping up credits only when a quota is what ran out', () => {
    const exception = buildException(QUOTA_EXHAUSTED);

    expect(exception.code).toBe(
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS,
    );
    expect(exception.message).toBe(
      'Campaign campaign-1 cannot be sent to 12 recipient(s): the email quota for userWorkspace is exhausted',
    );
  });

  it.each(['NO_SUBSCRIPTION', 'WORKSPACE_SUSPENDED'] as const)(
    'reports %s as a subscription problem rather than missing credits',
    (reason) => {
      const exception = buildException({
        kind: 'subscriptionInactive',
        reason,
      });

      expect(exception.code).toBe(
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SUBSCRIPTION_INACTIVE,
      );
      expect(exception.message).toContain(reason);
      expect(exception.userFriendlyMessage).not.toEqual(
        buildException(QUOTA_EXHAUSTED).userFriendlyMessage,
      );
    },
  );

  it('never leaks the refusal discriminator', () => {
    expect(buildException(QUOTA_EXHAUSTED).message).not.toContain(
      'quotaExhausted',
    );
    expect(
      buildException({
        kind: 'subscriptionInactive',
        reason: 'NO_SUBSCRIPTION',
      }).message,
    ).not.toContain('subscriptionInactive');
  });
});
