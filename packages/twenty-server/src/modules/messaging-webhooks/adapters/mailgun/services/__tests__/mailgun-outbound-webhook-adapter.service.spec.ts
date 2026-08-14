import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';
import { MailgunOutboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-outbound-webhook-adapter.service';
import { type MailgunWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-webhook-verifier.service';
import { type OutboundSuppressionHandlerService } from 'src/modules/messaging-webhooks/handlers/outbound-suppression-handler.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

const buildPayload = (eventData: object): Buffer => {
  return Buffer.from(
    JSON.stringify({
      signature: {
        timestamp: '1700000000',
        token: 'token-value',
        signature: 'signature-value',
      },
      'event-data': eventData,
    }),
  );
};

describe('MailgunOutboundWebhookAdapterService', () => {
  let mailgunWebhookVerifierService: { assertSigned: jest.Mock };
  let outboundSuppressionHandlerService: { handle: jest.Mock };
  let adapter: MailgunOutboundWebhookAdapterService;

  beforeEach(() => {
    mailgunWebhookVerifierService = { assertSigned: jest.fn() };
    outboundSuppressionHandlerService = { handle: jest.fn() };
    adapter = new MailgunOutboundWebhookAdapterService(
      mailgunWebhookVerifierService as unknown as MailgunWebhookVerifierService,
      outboundSuppressionHandlerService as unknown as OutboundSuppressionHandlerService,
    );
  });

  it('should normalize permanent failures into bounce suppression events', async () => {
    await adapter.handle(
      buildPayload({
        id: 'event-id',
        event: 'failed',
        severity: 'permanent',
        recipient: 'bounced@example.com',
        'user-variables': { workspace_id: WORKSPACE_ID },
        message: { headers: { 'message-id': 'message-id-1' } },
      }),
    );

    expect(mailgunWebhookVerifierService.assertSigned).toHaveBeenCalledWith({
      timestamp: '1700000000',
      token: 'token-value',
      signature: 'signature-value',
    });
    expect(outboundSuppressionHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      reason: MessageSuppressionReason.BOUNCE,
      emailAddresses: ['bounced@example.com'],
      providerMessageId: 'message-id-1',
      providerEventId: 'event-id',
    });
  });

  it('should ignore temporary failures', async () => {
    await adapter.handle(
      buildPayload({
        event: 'failed',
        severity: 'temporary',
        recipient: 'greylisted@example.com',
        'user-variables': { workspace_id: WORKSPACE_ID },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should normalize complaints into complaint suppression events', async () => {
    await adapter.handle(
      buildPayload({
        id: 'event-id',
        event: 'complained',
        recipient: 'annoyed@example.com',
        'user-variables': { workspace_id: WORKSPACE_ID },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      reason: MessageSuppressionReason.COMPLAINT,
      emailAddresses: ['annoyed@example.com'],
      providerMessageId: null,
      providerEventId: 'event-id',
    });
  });

  it('should skip events without a workspace variable', async () => {
    await adapter.handle(
      buildPayload({
        event: 'complained',
        recipient: 'annoyed@example.com',
      }),
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should ignore delivery events', async () => {
    await adapter.handle(
      buildPayload({
        event: 'delivered',
        recipient: 'happy@example.com',
        'user-variables': { workspace_id: WORKSPACE_ID },
      }),
    );

    expect(outboundSuppressionHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should reject unparsable payloads', async () => {
    await expect(adapter.handle(Buffer.from('not json'))).rejects.toThrow(
      'Invalid Mailgun webhook payload',
    );
  });

  it('should reject signed payloads without event data', async () => {
    await expect(
      adapter.handle(
        Buffer.from(
          JSON.stringify({
            signature: {
              timestamp: '1700000000',
              token: 'token-value',
              signature: 'signature-value',
            },
          }),
        ),
      ),
    ).rejects.toThrow('Mailgun webhook payload has no event data');
  });
});
