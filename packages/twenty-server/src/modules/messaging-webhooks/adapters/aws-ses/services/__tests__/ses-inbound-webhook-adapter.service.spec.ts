import { type SnsSignatureVerifierService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-signature-verifier.service';
import { type SnsSubscriptionConfirmerService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/sns-subscription-confirmer.service';
import { SesInboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/aws-ses/services/ses-inbound-webhook-adapter.service';
import { type InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';

describe('SesInboundWebhookAdapterService', () => {
  let snsSignatureVerifierService: { assertAllowedAndSigned: jest.Mock };
  let snsSubscriptionConfirmerService: { confirm: jest.Mock };
  let inboundMailHandlerService: { handle: jest.Mock };
  let adapter: SesInboundWebhookAdapterService;

  beforeEach(() => {
    snsSignatureVerifierService = {
      assertAllowedAndSigned: jest.fn().mockResolvedValue(undefined),
    };
    snsSubscriptionConfirmerService = { confirm: jest.fn() };
    inboundMailHandlerService = { handle: jest.fn() };
    adapter = new SesInboundWebhookAdapterService(
      snsSignatureVerifierService as unknown as SnsSignatureVerifierService,
      snsSubscriptionConfirmerService as unknown as SnsSubscriptionConfirmerService,
      inboundMailHandlerService as unknown as InboundMailHandlerService,
    );
  });

  it('should reject unparsable payloads', async () => {
    await expect(adapter.handle(Buffer.from('not json'))).rejects.toThrow(
      'Invalid SNS payload',
    );
  });

  it('should normalize S3 receipt notifications', async () => {
    await adapter.handle(
      Buffer.from(
        JSON.stringify({
          Type: 'Notification',
          MessageId: 'sns-message-id',
          Message: JSON.stringify({
            notificationType: 'Received',
            mail: { commonHeaders: { subject: 'Hello group' } },
            receipt: {
              recipients: ['ch_abc@groups.example.com'],
              action: {
                type: 'S3',
                bucketName: 'inbound-bucket',
                objectKey: 'raw/object-key',
              },
            },
          }),
        }),
      ),
    );

    expect(inboundMailHandlerService.handle).toHaveBeenCalledWith({
      recipients: ['ch_abc@groups.example.com'],
      subject: 'Hello group',
      message: { source: 'SES_S3', reference: 'raw/object-key' },
      dedupeKey: 'sns-message-id',
    });
  });

  it('should pass a null message reference for non-S3 receipt actions', async () => {
    await adapter.handle(
      Buffer.from(
        JSON.stringify({
          Type: 'Notification',
          MessageId: 'sns-message-id',
          Message: JSON.stringify({
            receipt: {
              recipients: ['unsubscribe@groups.example.com'],
              action: { type: 'SNS' },
            },
            mail: { commonHeaders: { subject: 'token' } },
          }),
        }),
      ),
    );

    expect(inboundMailHandlerService.handle).toHaveBeenCalledWith({
      recipients: ['unsubscribe@groups.example.com'],
      subject: 'token',
      message: null,
      dedupeKey: 'sns-message-id',
    });
  });
});
