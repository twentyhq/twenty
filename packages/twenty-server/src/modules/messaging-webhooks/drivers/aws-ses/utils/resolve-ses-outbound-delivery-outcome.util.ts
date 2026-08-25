import { isNonEmptyArray } from 'twenty-shared/utils';

import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/types/campaign-provider-outcome.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';
import { type OutboundDeliveryOutcome } from 'src/modules/messaging-webhooks/types/outbound-delivery-outcome.type';

const extractRecipientAddresses = (
  recipients: { emailAddress: string }[] | undefined,
): string[] => (recipients ?? []).map((recipient) => recipient.emailAddress);

export const resolveSesOutboundDeliveryOutcome = ({
  eventName,
  payload,
}: {
  eventName: string;
  payload: SesOutboundEventPayload;
}): OutboundDeliveryOutcome | null => {
  switch (eventName) {
    case 'Email Delivered':
    case 'Delivery':
      return {
        outcome: CAMPAIGN_PROVIDER_OUTCOME.DELIVERED,
        suppression: null,
        providerEventId: null,
      };
    case 'Email Rejected':
    case 'Reject':
      return {
        outcome: CAMPAIGN_PROVIDER_OUTCOME.REJECTED,
        suppression: null,
        providerEventId: null,
      };
    case 'Email Rendering Failed':
    case 'Rendering Failure':
      return {
        outcome: CAMPAIGN_PROVIDER_OUTCOME.RENDERING_FAILED,
        suppression: null,
        providerEventId: null,
      };
    case 'Email Bounced':
    case 'Bounce': {
      const bounce = payload.bounce;
      const emailAddresses = extractRecipientAddresses(
        bounce?.bouncedRecipients,
      );
      const providerEventId = bounce?.feedbackId ?? null;

      if (bounce?.bounceType !== 'Permanent') {
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
    case 'Email Complaint Received':
    case 'Complaint': {
      const complaint = payload.complaint;
      const emailAddresses = extractRecipientAddresses(
        complaint?.complainedRecipients,
      );

      return {
        outcome: CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED,
        suppression: isNonEmptyArray(emailAddresses)
          ? { reason: MessageSuppressionReason.COMPLAINT, emailAddresses }
          : null,
        providerEventId: complaint?.feedbackId ?? null,
      };
    }
    default:
      return null;
  }
};
