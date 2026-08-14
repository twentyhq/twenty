import { EmailingDomainTenantStatus } from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain-tenant-status.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-signature-verifier.service';
import { type SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-subscription-confirmer.service';
import { SesOutboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/ses-outbound-webhook-adapter.service';
import { type OutboundSendingStateHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-sending-state-handler.service';
import { type OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const CONFIGURATION_SET_ARN = `arn:aws:ses:us-east-1:123456789012:configuration-set/twenty-workspace-${WORKSPACE_ID}`;

const buildSnsEnvelope = (message: object): Buffer => {
  return Buffer.from(
    JSON.stringify({
      Type: 'Notification',
      MessageId: 'sns-message-id',
      TopicArn: 'arn:aws:sns:us-east-1:123456789012:outbound-topic',
      Message: JSON.stringify(message),
    }),
  );
};

describe('SesOutboundWebhookAdapterService', () => {
  let snsSignatureVerifierService: { assertAllowedAndSigned: jest.Mock };
  let snsSubscriptionConfirmerService: { confirm: jest.Mock };
  let outboundSuppressionHandlerService: { handle: jest.Mock };
  let outboundSendingStateHandlerService: { handle: jest.Mock };
  let adapter: SesOutboundWebhookAdapterService;

  beforeEach(() => {
    snsSignatureVerifierService = {
      assertAllowedAndSigned: jest.fn().mockResolvedValue(undefined),
    };
    snsSubscriptionConfirmerService = { confirm: jest.fn() };
    outboundSuppressionHandlerService = { handle: jest.fn() };
    outboundSendingStateHandlerService = { handle: jest.fn() };
    adapter = new SesOutboundWebhookAdapterService(
      snsSignatureVerifierService as unknown as SnsSignatureVerifierService,
      snsSubscriptionConfirmerService as unknown as SnsSubscriptionConfirmerService,
      outboundSuppressionHandlerService as unknown as OutboundSuppressionHandlerService,
      outboundSendingStateHandlerService as unknown as OutboundSendingStateHandlerService,
    );
  });

  it('should confirm SNS subscription requests', async () => {
    await adapter.handle(
      Buffer.from(
        JSON.stringify({
          Type: 'SubscriptionConfirmation',
          MessageId: 'sns-message-id',
          SubscribeURL: 'https://sns.us-east-1.amazonaws.com/confirm',
        }),
      ),
    );

    expect(snsSubscriptionConfirmerService.confirm).toHaveBeenCalledWith(
      'https://sns.us-east-1.amazonaws.com/confirm',
    );
    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should normalize a permanent bounce into a suppression event', async () => {
    await adapter.handle(
      buildSnsEnvelope({
        source: 'aws.ses',
        'detail-type': 'Email Bounced',
        resources: [CONFIGURATION_SET_ARN],
        detail: {
          bounce: {
            bounceType: 'Permanent',
            feedbackId: 'feedback-id',
            bouncedRecipients: [{ emailAddress: 'bounced@example.com' }],
          },
          mail: { messageId: 'provider-message-id' },
        },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      reason: MessageSuppressionReason.BOUNCE,
      emailAddresses: ['bounced@example.com'],
      providerMessageId: 'provider-message-id',
      providerEventId: 'feedback-id',
    });
  });

  it('should ignore transient bounces', async () => {
    await adapter.handle(
      buildSnsEnvelope({
        source: 'aws.ses',
        'detail-type': 'Email Bounced',
        resources: [CONFIGURATION_SET_ARN],
        detail: {
          bounce: {
            bounceType: 'Transient',
            bouncedRecipients: [{ emailAddress: 'greylisted@example.com' }],
          },
        },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should normalize complaints into a suppression event', async () => {
    await adapter.handle(
      buildSnsEnvelope({
        source: 'aws.ses',
        'detail-type': 'Email Complaint Received',
        resources: [CONFIGURATION_SET_ARN],
        detail: {
          complaint: {
            feedbackId: 'feedback-id',
            complainedRecipients: [{ emailAddress: 'annoyed@example.com' }],
          },
        },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      reason: MessageSuppressionReason.COMPLAINT,
      emailAddresses: ['annoyed@example.com'],
      providerMessageId: null,
      providerEventId: 'feedback-id',
    });
  });

  it('should map sending status events to tenant statuses', async () => {
    await adapter.handle(
      buildSnsEnvelope({
        source: 'aws.ses',
        'detail-type': 'Sending Status Enabled',
        resources: [CONFIGURATION_SET_ARN],
      }),
    );

    expect(outboundSendingStateHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      status: EmailingDomainTenantStatus.ACTIVE,
    });

    await adapter.handle(
      buildSnsEnvelope({
        source: 'aws.ses',
        'detail-type': 'Sending Status Disabled',
        resources: [CONFIGURATION_SET_ARN],
      }),
    );

    expect(outboundSendingStateHandlerService.handle).toHaveBeenLastCalledWith({
      workspaceId: WORKSPACE_ID,
      status: EmailingDomainTenantStatus.PAUSED,
    });
  });

  it('should skip events whose workspace cannot be resolved', async () => {
    await adapter.handle(
      buildSnsEnvelope({
        source: 'aws.ses',
        'detail-type': 'Email Bounced',
        resources: ['arn:aws:ses:us-east-1:123456789012:identity/example.com'],
        detail: {
          bounce: {
            bounceType: 'Permanent',
            bouncedRecipients: [{ emailAddress: 'bounced@example.com' }],
          },
        },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });
});
