import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { EmailingDomainExceptionCode } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { buildCampaignSendRefusalException } from 'src/modules/emailing/utils/build-campaign-send-refusal-exception.util';

const buildException = (sendRefusal: UsageRefusal) =>
  buildCampaignSendRefusalException({
    campaignId: 'campaign-1',
    recipientCount: 12,
    sendRefusal,
  });

const buildQuotaRefusal = ({
  exhaustedKind,
  isDefault,
}: {
  exhaustedKind: ExhaustedKind;
  isDefault?: boolean;
}): UsageRefusal => ({
  kind: 'quotaExhausted',
  exhaustedScope: {
    resourceType: UsageResourceType.EMAIL,
    limitKind: 'quota',
    exhaustedKind,
    spenderType: 'userWorkspace',
    spenderId: 'user-workspace-1',
    operationType: UsageOperationType.EMAIL_SEND,
    limitValue: 1000,
    remaining: 0,
    periodCount: 1,
    periodUnit: 'month',
    retryAfterMs: 0,
    isDefault,
  } satisfies ExhaustedScope,
});

describe('buildCampaignSendRefusalException', () => {
  it('advises topping up credits only when the allowance is what ran out', () => {
    const exception = buildException(
      buildQuotaRefusal({ exhaustedKind: 'allowance' }),
    );

    expect(exception.code).toBe(
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS,
    );
    expect(exception.message).toBe(
      'Campaign campaign-1 cannot be sent to 12 recipient(s): the workspace credit allowance is exhausted',
    );
  });

  it('names the limit rather than the credits when a configured cap is reached', () => {
    const exception = buildException(
      buildQuotaRefusal({ exhaustedKind: 'limit' }),
    );

    expect(exception.code).toBe(
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED,
    );
    expect(exception.message).toBe(
      'Campaign campaign-1 cannot be sent to 12 recipient(s): an email usage limit of 1000 for userWorkspace is reached',
    );
  });

  it('does not tell the customer to raise a default limit only an operator can change', () => {
    const configuredLimitException = buildException(
      buildQuotaRefusal({ exhaustedKind: 'limit' }),
    );
    const defaultLimitException = buildException(
      buildQuotaRefusal({ exhaustedKind: 'limit', isDefault: true }),
    );

    expect(defaultLimitException.code).toBe(
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED,
    );
    expect(defaultLimitException.userFriendlyMessage).not.toEqual(
      configuredLimitException.userFriendlyMessage,
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
    },
  );

  it('gives each refusal its own user facing advice', () => {
    const userFriendlyMessages = [
      buildException(buildQuotaRefusal({ exhaustedKind: 'allowance' })),
      buildException(buildQuotaRefusal({ exhaustedKind: 'limit' })),
      buildException({
        kind: 'subscriptionInactive',
        reason: 'NO_SUBSCRIPTION',
      }),
    ].map((exception) => exception.userFriendlyMessage);

    expect(new Set(userFriendlyMessages).size).toBe(3);
  });

  it('never leaks the refusal discriminator', () => {
    expect(
      buildException(buildQuotaRefusal({ exhaustedKind: 'limit' })).message,
    ).not.toContain('quotaExhausted');
    expect(
      buildException({
        kind: 'subscriptionInactive',
        reason: 'NO_SUBSCRIPTION',
      }).message,
    ).not.toContain('subscriptionInactive');
  });
});
