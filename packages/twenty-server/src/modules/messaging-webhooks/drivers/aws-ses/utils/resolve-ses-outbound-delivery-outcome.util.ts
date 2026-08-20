import { isNonEmptyArray } from 'twenty-shared/utils';

import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
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
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
        suppression: null,
        providerEventId: null,
      };
    case 'Email Rejected':
    case 'Reject':
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.REJECTED,
        suppression: null,
        providerEventId: null,
      };
    case 'Email Rendering Failed':
    case 'Rendering Failure':
      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.RENDERING_FAILED,
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
          deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
          suppression: null,
          providerEventId,
        };
      }

      return {
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
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
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
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
