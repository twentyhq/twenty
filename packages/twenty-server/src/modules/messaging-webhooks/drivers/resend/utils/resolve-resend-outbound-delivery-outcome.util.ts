import { isNonEmptyArray } from 'twenty-shared/utils';

import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type ResendWebhookEvent } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-event.type';
import { type OutboundDeliveryOutcome } from 'src/modules/messaging-webhooks/types/outbound-delivery-outcome.type';

export const resolveResendOutboundDeliveryOutcome = (
  event: ResendWebhookEvent,
): OutboundDeliveryOutcome | null => {
  const providerEventId = event.data?.email_id ?? null;
  const envelopeRecipients = [
    ...(event.data?.to ?? []),
    ...(event.data?.cc ?? []),
    ...(event.data?.bcc ?? []),
  ];
  const emailAddresses =
    envelopeRecipients.length === 1 ? envelopeRecipients : [];

  if (event.type === 'email.delivered') {
    return {
      outcome: CAMPAIGN_PROVIDER_OUTCOME.DELIVERED,
      suppression: null,
      providerEventId,
    };
  }

  if (event.type === 'email.failed') {
    return {
      outcome: CAMPAIGN_PROVIDER_OUTCOME.REJECTED,
      suppression: null,
      providerEventId,
    };
  }

  if (event.type === 'email.bounced') {
    if (event.data?.bounce?.type !== 'Permanent') {
      return {
        outcome: CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED,
        suppression: null,
        providerEventId,
      };
    }

    return {
      outcome: CAMPAIGN_PROVIDER_OUTCOME.BOUNCED,
      suppression: isNonEmptyArray(emailAddresses)
        ? { reason: MessageSuppressionReason.BOUNCE, emailAddresses }
        : null,
      providerEventId,
    };
  }

  if (event.type === 'email.complained') {
    return {
      outcome: CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED,
      suppression: isNonEmptyArray(emailAddresses)
        ? { reason: MessageSuppressionReason.COMPLAINT, emailAddresses }
        : null,
      providerEventId,
    };
  }

  return null;
};
