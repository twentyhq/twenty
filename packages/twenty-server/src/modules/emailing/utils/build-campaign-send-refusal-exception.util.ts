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

  const { limitKind, spenderType } = sendRefusal.exhaustedScope;

  return new EmailingDomainException(
    `Campaign ${campaignId} cannot be sent to ${recipientCount} recipient(s): the email ${limitKind} for ${spenderType} is exhausted`,
    EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_INSUFFICIENT_CREDITS,
  );
};
