import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type ResendWebhookEvent } from 'src/modules/messaging-webhooks/drivers/resend/types/resend-webhook-event.type';
import { resolveResendOutboundDeliveryOutcome } from 'src/modules/messaging-webhooks/drivers/resend/utils/resolve-resend-outbound-delivery-outcome.util';

const buildEvent = (
  type: string,
  data?: ResendWebhookEvent['data'],
): ResendWebhookEvent => ({ type, data });

describe('resolveResendOutboundDeliveryOutcome', () => {
  it('should record a delivery without suppressing anyone', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.delivered', { email_id: 'email-id' }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
      suppression: null,
      providerEventId: 'email-id',
    });
  });

  it('should record a send failure without suppressing the recipient', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.failed', {
          email_id: 'email-id',
          to: ['someone@example.com'],
        }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.REJECTED,
      suppression: null,
      providerEventId: 'email-id',
    });
  });

  it('should suppress the recipients of a permanent bounce', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.bounced', {
          email_id: 'email-id',
          to: ['dead@example.com'],
          bounce: { type: 'Permanent' },
        }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
      suppression: {
        reason: MessageSuppressionReason.BOUNCE,
        emailAddresses: ['dead@example.com'],
      },
      providerEventId: 'email-id',
    });
  });

  it('should record a transient bounce without suppressing the recipient', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.bounced', {
          email_id: 'email-id',
          to: ['full-mailbox@example.com'],
          bounce: { type: 'Transient' },
        }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
      suppression: null,
      providerEventId: 'email-id',
    });
  });

  it('should suppress the recipients of a complaint', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.complained', {
          email_id: 'email-id',
          to: ['angry@example.com'],
        }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
      suppression: {
        reason: MessageSuppressionReason.COMPLAINT,
        emailAddresses: ['angry@example.com'],
      },
      providerEventId: 'email-id',
    });
  });

  it('should not suppress anyone when the bounce cannot be attributed to a single recipient', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.bounced', {
          email_id: 'email-id',
          to: ['first@example.com', 'second@example.com'],
          bounce: { type: 'Permanent' },
        }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
      suppression: null,
      providerEventId: 'email-id',
    });
  });

  it('should not suppress the to recipient when a copied address makes the bounce ambiguous', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(
        buildEvent('email.bounced', {
          email_id: 'email-id',
          to: ['first@example.com'],
          cc: ['copied@example.com'],
          bounce: { type: 'Permanent' },
        }),
      ),
    ).toEqual({
      deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
      suppression: null,
      providerEventId: 'email-id',
    });
  });

  it('should return null for an inbound event', () => {
    expect(
      resolveResendOutboundDeliveryOutcome(buildEvent('email.received')),
    ).toBeNull();
  });
});
