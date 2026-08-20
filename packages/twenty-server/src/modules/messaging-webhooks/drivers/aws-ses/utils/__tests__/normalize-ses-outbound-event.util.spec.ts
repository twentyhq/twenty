import { CAMPAIGN_MESSAGE_DELIVERY_STATUS } from 'src/engine/core-modules/emailing-domain/constants/campaign.constant';
import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { normalizeSesOutboundEvent } from 'src/modules/messaging-webhooks/drivers/aws-ses/utils/normalize-ses-outbound-event.util';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const CONFIGURATION_SET_ARN = `arn:aws:ses:us-east-1:123456789012:configuration-set/twenty-workspace-${WORKSPACE_ID}`;
const CONFIGURATION_SET_TAGS = {
  'ses:configuration-set': [`twenty-workspace-${WORKSPACE_ID}`],
};

describe('normalizeSesOutboundEvent', () => {
  it('should suppress permanently bounced recipients from an EventBridge envelope', () => {
    const event = normalizeSesOutboundEvent({
      source: 'aws.ses',
      'detail-type': 'Email Bounced',
      resources: [CONFIGURATION_SET_ARN],
      detail: {
        mail: { messageId: 'message-id' },
        bounce: {
          bounceType: 'Permanent',
          feedbackId: 'feedback-id',
          bouncedRecipients: [{ emailAddress: 'bounced@example.com' }],
        },
      },
    });

    expect(event).toEqual({
      status: 'DELIVERY',
      delivery: {
        workspaceId: WORKSPACE_ID,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
        suppression: {
          reason: MessageSuppressionReason.BOUNCE,
          emailAddresses: ['bounced@example.com'],
        },
        providerMessageId: 'message-id',
        providerEventId: 'feedback-id',
      },
    });
  });

  it('should suppress complained recipients from a raw SES event-publishing envelope', () => {
    const event = normalizeSesOutboundEvent({
      eventType: 'Complaint',
      mail: { messageId: 'message-id', tags: CONFIGURATION_SET_TAGS },
      complaint: {
        feedbackId: 'feedback-id',
        complainedRecipients: [{ emailAddress: 'complained@example.com' }],
      },
    });

    expect(event).toEqual({
      status: 'DELIVERY',
      delivery: {
        workspaceId: WORKSPACE_ID,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.COMPLAINED,
        suppression: {
          reason: MessageSuppressionReason.COMPLAINT,
          emailAddresses: ['complained@example.com'],
        },
        providerMessageId: 'message-id',
        providerEventId: 'feedback-id',
      },
    });
  });

  it('should suppress permanently bounced recipients from a raw SES event-publishing envelope', () => {
    const event = normalizeSesOutboundEvent({
      eventType: 'Bounce',
      mail: { messageId: 'message-id', tags: CONFIGURATION_SET_TAGS },
      bounce: {
        bounceType: 'Permanent',
        bouncedRecipients: [{ emailAddress: 'bounced@example.com' }],
      },
    });

    expect(event).toEqual({
      status: 'DELIVERY',
      delivery: {
        workspaceId: WORKSPACE_ID,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.BOUNCED,
        suppression: {
          reason: MessageSuppressionReason.BOUNCE,
          emailAddresses: ['bounced@example.com'],
        },
        providerMessageId: 'message-id',
        providerEventId: null,
      },
    });
  });

  it('should record a transient bounce without suppressing the recipient', () => {
    const event = normalizeSesOutboundEvent({
      eventType: 'Bounce',
      mail: { tags: CONFIGURATION_SET_TAGS },
      bounce: {
        bounceType: 'Transient',
        bouncedRecipients: [{ emailAddress: 'bounced@example.com' }],
      },
    });

    expect(event).toEqual({
      status: 'DELIVERY',
      delivery: {
        workspaceId: WORKSPACE_ID,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.SOFT_BOUNCED,
        suppression: null,
        providerMessageId: null,
        providerEventId: null,
      },
    });
  });

  it('should record a delivery from a raw SES event-publishing envelope', () => {
    const event = normalizeSesOutboundEvent({
      eventType: 'Delivery',
      mail: { messageId: 'message-id', tags: CONFIGURATION_SET_TAGS },
    });

    expect(event).toEqual({
      status: 'DELIVERY',
      delivery: {
        workspaceId: WORKSPACE_ID,
        deliveryStatus: CAMPAIGN_MESSAGE_DELIVERY_STATUS.DELIVERED,
        suppression: null,
        providerMessageId: 'message-id',
        providerEventId: null,
      },
    });
  });

  it('should map sending status events to a tenant status', () => {
    const event = normalizeSesOutboundEvent({
      source: 'aws.ses',
      'detail-type': 'Sending Status Disabled',
      resources: [CONFIGURATION_SET_ARN],
    });

    expect(event).toEqual({
      status: 'SENDING_STATE',
      sendingState: {
        workspaceId: WORKSPACE_ID,
        status: EmailingDomainTenantStatus.PAUSED,
      },
    });
  });

  it('should mark an event whose workspace cannot be resolved as unprocessable', () => {
    const event = normalizeSesOutboundEvent({
      eventType: 'Complaint',
      mail: { tags: { 'ses:configuration-set': ['someone-elses-set'] } },
      complaint: {
        complainedRecipients: [{ emailAddress: 'complained@example.com' }],
      },
    });

    expect(event).toEqual({
      status: 'UNPROCESSABLE',
      eventName: 'Complaint',
      reason: 'UNRESOLVED_WORKSPACE',
    });
  });

  it('should mark an unknown event name as unprocessable', () => {
    const event = normalizeSesOutboundEvent({
      eventType: 'DeliveryDelay',
      mail: { tags: CONFIGURATION_SET_TAGS },
    });

    expect(event).toEqual({
      status: 'UNPROCESSABLE',
      eventName: 'DeliveryDelay',
      reason: 'UNSUPPORTED_EVENT_NAME',
    });
  });
});
