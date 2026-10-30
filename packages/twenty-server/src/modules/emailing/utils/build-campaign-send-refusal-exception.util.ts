import { msg, plural } from '@lingui/core/macro';

import { SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE } from 'src/engine/core-modules/billing/constants/subscription-inactive-reason-user-friendly-message.constant';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';

export const buildCampaignSendRefusalException = ({
  campaignId,
  recipientCount,
  sendRefusal,
}: {
  campaignId: string;
  recipientCount: number;
  sendRefusal: UsageRefusal;
}): EmailingDomainException => {
  if (sendRefusal.kind === 'subscriptionInactive') {
    return new EmailingDomainException(
      `Campaign ${campaignId} cannot be sent to ${recipientCount} recipient(s) without an active subscription: ${sendRefusal.reason}`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_SUBSCRIPTION_INACTIVE,
      {
        userFriendlyMessage:
          SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE[
            sendRefusal.reason
          ],
      },
    );
  }

  const { exhaustedKind, spenderType, limitValue, isDefault } =
    sendRefusal.exhaustedScope;

  if (exhaustedKind === 'workspaceAllowance') {
    return new EmailingDomainException(
      `Campaign ${campaignId} cannot be sent to ${recipientCount} recipient(s): the workspace credit allowance is exhausted`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS,
    );
  }

  if (isDefault === true) {
    return new EmailingDomainException(
      `Campaign ${campaignId} cannot be sent to ${recipientCount} recipient(s): it does not fit in the default email limit of ${limitValue}`,
      EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED,
      {
        userFriendlyMessage: msg`Your daily limit is ${plural(limitValue, { one: '# email', other: '# emails' })}, and this campaign would go over what's left today. Contact us to raise it.`,
      },
    );
  }

  return new EmailingDomainException(
    `Campaign ${campaignId} cannot be sent to ${recipientCount} recipient(s): an email usage limit of ${limitValue} for ${spenderType} is reached`,
    EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_USAGE_LIMIT_REACHED,
  );
};
