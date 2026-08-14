import { MailgunInboundWebhookAdapterService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-inbound-webhook-adapter.service';
import { type MailgunWebhookVerifierService } from 'src/modules/messaging-webhooks/adapters/mailgun/services/mailgun-webhook-verifier.service';
import { type InboundMailHandlerService } from 'src/modules/messaging-webhooks/handlers/inbound-mail-handler.service';

describe('MailgunInboundWebhookAdapterService', () => {
  let mailgunWebhookVerifierService: { assertSigned: jest.Mock };
  let inboundMailHandlerService: { handle: jest.Mock };
  let adapter: MailgunInboundWebhookAdapterService;

  beforeEach(() => {
    mailgunWebhookVerifierService = { assertSigned: jest.fn() };
    inboundMailHandlerService = { handle: jest.fn() };
    adapter = new MailgunInboundWebhookAdapterService(
      mailgunWebhookVerifierService as unknown as MailgunWebhookVerifierService,
      inboundMailHandlerService as unknown as InboundMailHandlerService,
    );
  });

  it('should verify the signature and enqueue the stored message', async () => {
    await adapter.handle(
      {
        timestamp: '1700000000',
        token: 'token-value',
        signature: 'signature-value',
        recipient: 'ch_abc@groups.example.com',
        subject: 'Hello group',
        'message-url': 'https://storage.api.mailgun.net/v3/m/key',
      },
      'application/x-www-form-urlencoded',
    );

    expect(mailgunWebhookVerifierService.assertSigned).toHaveBeenCalledWith({
      timestamp: '1700000000',
      token: 'token-value',
      signature: 'signature-value',
    });
    expect(inboundMailHandlerService.handle).toHaveBeenCalledWith({
      recipients: ['ch_abc@groups.example.com'],
      subject: 'Hello group',
      message: {
        source: 'MAILGUN',
        reference: 'https://storage.api.mailgun.net/v3/m/key',
      },
      dedupeKey: 'token-value',
    });
  });

  it('should reject notifications without a message url', async () => {
    await expect(
      adapter.handle(
        {
          timestamp: '1700000000',
          token: 'token-value',
          signature: 'signature-value',
          recipient: 'ch_abc@groups.example.com',
        },
        'application/x-www-form-urlencoded',
      ),
    ).rejects.toThrow('missing message-url or recipient');

    expect(inboundMailHandlerService.handle).not.toHaveBeenCalled();
  });

  it('should reject unusable payloads', async () => {
    await expect(adapter.handle('text', 'text/plain')).rejects.toThrow(
      'Invalid Mailgun inbound notification payload',
    );
  });
});
