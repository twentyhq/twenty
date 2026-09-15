import { CAMPAIGN_PROVIDER_OUTCOME } from 'src/engine/core-modules/emailing-domain/constants/campaign-provider-outcome.constant';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type SesOutboundEventPayload } from 'src/modules/messaging-webhooks/drivers/aws-ses/types/ses-outbound-event-payload.type';
import { resolveSesOutboundDeliveryOutcome } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/resolve-ses-outbound-delivery-outcome.util';

const resolveOutcome = (eventName: string, payload?: SesOutboundEventPayload) =>
  resolveSesOutboundDeliveryOutcome({ eventName, payload: payload ?? {} });

describe('resolveSesOutboundDeliveryOutcome', () => {
  it('should record a delivery without suppressing anyone', () => {
    expect(resolveOutcome('Email Delivered')).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.DELIVERED,
      suppression: null,
      providerEventId: null,
    });
  });

  it('should record a rejection as a send-side failure', () => {
    expect(resolveOutcome('Email Rejected')).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.REJECTED,
      suppression: null,
      providerEventId: null,
    });
  });

  it('should record a rendering failure as a send-side failure', () => {
    expect(resolveOutcome('Email Rendering Failed')).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.RENDERING_FAILED,
      suppression: null,
      providerEventId: null,
    });
  });

  it('should suppress the recipients of a permanent bounce', () => {
    expect(
      resolveOutcome('Email Bounced', {
        bounce: {
          bounceType: 'Permanent',
          feedbackId: 'feedback-id',
          bouncedRecipients: [{ emailAddress: 'dead@example.com' }],
        },
      }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.BOUNCED,
      suppression: {
        reason: MessageSuppressionReason.BOUNCE,
        emailAddresses: ['dead@example.com'],
      },
      providerEventId: 'feedback-id',
    });
  });

  it('should record a transient bounce without suppressing the recipient', () => {
    expect(
      resolveOutcome('Email Bounced', {
        bounce: {
          bounceType: 'Transient',
          feedbackId: 'feedback-id',
          bouncedRecipients: [{ emailAddress: 'full-mailbox@example.com' }],
        },
      }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED,
      suppression: null,
      providerEventId: 'feedback-id',
    });
  });

  it('should record an undetermined bounce without suppressing the recipient', () => {
    expect(
      resolveOutcome('Email Bounced', {
        bounce: {
          bounceType: 'Undetermined',
          bouncedRecipients: [{ emailAddress: 'unclear@example.com' }],
        },
      }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.SOFT_BOUNCED,
      suppression: null,
      providerEventId: null,
    });
  });

  it('should record a permanent bounce carrying no recipient without suppressing', () => {
    expect(
      resolveOutcome('Email Bounced', { bounce: { bounceType: 'Permanent' } }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.BOUNCED,
      suppression: null,
      providerEventId: null,
    });
  });

  it('should suppress the recipients of a complaint', () => {
    expect(
      resolveOutcome('Email Complaint Received', {
        complaint: {
          feedbackId: 'complaint-id',
          complainedRecipients: [{ emailAddress: 'angry@example.com' }],
        },
      }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED,
      suppression: {
        reason: MessageSuppressionReason.COMPLAINT,
        emailAddresses: ['angry@example.com'],
      },
      providerEventId: 'complaint-id',
    });
  });

  it('should resolve the raw SES event-publishing event names too', () => {
    expect(resolveOutcome('Delivery')).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.DELIVERED,
      suppression: null,
      providerEventId: null,
    });
    expect(resolveOutcome('Reject')).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.REJECTED,
      suppression: null,
      providerEventId: null,
    });
    expect(resolveOutcome('Rendering Failure')).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.RENDERING_FAILED,
      suppression: null,
      providerEventId: null,
    });
    expect(
      resolveOutcome('Bounce', {
        bounce: {
          bounceType: 'Permanent',
          bouncedRecipients: [{ emailAddress: 'dead@example.com' }],
        },
      }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.BOUNCED,
      suppression: {
        reason: MessageSuppressionReason.BOUNCE,
        emailAddresses: ['dead@example.com'],
      },
      providerEventId: null,
    });
    expect(
      resolveOutcome('Complaint', {
        complaint: {
          complainedRecipients: [{ emailAddress: 'angry@example.com' }],
        },
      }),
    ).toEqual({
      outcome: CAMPAIGN_PROVIDER_OUTCOME.COMPLAINED,
      suppression: {
        reason: MessageSuppressionReason.COMPLAINT,
        emailAddresses: ['angry@example.com'],
      },
      providerEventId: null,
    });
  });

  it('should return null for a sending-state event', () => {
    expect(resolveOutcome('Sending Status Disabled')).toBeNull();
  });
});
