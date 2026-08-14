import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { type ResendWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/resend/services/resend-webhook-verifier.service';
import { ResendWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/resend/services/resend-webhook-adapter.service';
import { type InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';
import { type OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const HEADERS = {
  svixId: 'msg_1',
  svixTimestamp: '1700000000',
  svixSignature: 'v1,signature',
};

const buildEvent = (event: object): Buffer => {
  return Buffer.from(JSON.stringify(event));
};

describe('ResendWebhookAdapterService', () => {
  let resendWebhookVerifierService: { assertSigned: jest.Mock };
  let outboundSuppressionHandlerService: { handle: jest.Mock };
  let inboundMailHandlerService: { handle: jest.Mock };
  let adapter: ResendWebhookAdapterService;

  beforeEach(() => {
    resendWebhookVerifierService = { assertSigned: jest.fn() };
    outboundSuppressionHandlerService = { handle: jest.fn() };
    inboundMailHandlerService = { handle: jest.fn() };
    adapter = new ResendWebhookAdapterService(
      resendWebhookVerifierService as unknown as ResendWebhookVerifierService,
      outboundSuppressionHandlerService as unknown as OutboundSuppressionHandlerService,
      inboundMailHandlerService as unknown as InboundMailHandlerService,
    );
  });

  it('should normalize a permanent bounce into a suppression event', async () => {
    await adapter.handle(
      buildEvent({
        type: 'email.bounced',
        data: {
          email_id: 'email-id-1',
          to: ['bounced@example.com'],
          tags: { workspace_id: WORKSPACE_ID },
          bounce: { type: 'Permanent', subType: 'General' },
        },
      }),
      HEADERS,
    );

    expect(outboundSuppressionHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      reason: MessageSuppressionReason.BOUNCE,
      emailAddresses: ['bounced@example.com'],
      providerMessageId: 'email-id-1',
      providerEventId: 'email-id-1',
    });
  });

  it('should ignore transient bounces', async () => {
    await adapter.handle(
      buildEvent({
        type: 'email.bounced',
        data: {
          email_id: 'email-id-1',
          to: ['greylisted@example.com'],
          tags: { workspace_id: WORKSPACE_ID },
          bounce: { type: 'Transient' },
        },
      }),
      HEADERS,
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should normalize complaints into a suppression event', async () => {
    await adapter.handle(
      buildEvent({
        type: 'email.complained',
        data: {
          email_id: 'email-id-1',
          to: ['annoyed@example.com'],
          tags: { workspace_id: WORKSPACE_ID },
        },
      }),
      HEADERS,
    );

    expect(outboundSuppressionHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      reason: MessageSuppressionReason.COMPLAINT,
      emailAddresses: ['annoyed@example.com'],
      providerMessageId: 'email-id-1',
      providerEventId: 'email-id-1',
    });
  });

  it('should skip suppression events without a workspace tag', async () => {
    await adapter.handle(
      buildEvent({
        type: 'email.complained',
        data: { email_id: 'email-id-1', to: ['annoyed@example.com'] },
      }),
      HEADERS,
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should route received emails to the inbound mail handler', async () => {
    await adapter.handle(
      buildEvent({
        type: 'email.received',
        data: {
          email_id: 'received-email-id',
          from: 'sender@example.com',
          to: ['ch_abc@groups.example.com'],
          cc: ['other@example.com'],
          received_for: ['ch_abc@groups.example.com'],
          subject: 'Hello group',
        },
      }),
      HEADERS,
    );

    expect(inboundMailHandlerService.handle).toHaveBeenCalledWith({
      recipients: [
        'ch_abc@groups.example.com',
        'ch_abc@groups.example.com',
        'other@example.com',
      ],
      subject: 'Hello group',
      message: { source: 'RESEND', reference: 'received-email-id' },
      dedupeKey: 'received-email-id',
    });
  });

  it('should ignore event types that are not consumed', async () => {
    await adapter.handle(
      buildEvent({ type: 'email.delivered', data: { email_id: 'x' } }),
      HEADERS,
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
    expect(inboundMailHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should reject unparsable payloads after verification', async () => {
    await expect(
      adapter.handle(Buffer.from('not json'), HEADERS),
    ).rejects.toThrow('Invalid Resend webhook payload');

    expect(resendWebhookVerifierService.assertSigned).toHaveBeenCalled();
  });
});
