import { resolveInboundEmailMessageReference } from 'src/modules/messaging/message-import-manager/drivers/inbound-email/utils/resolve-inbound-email-message-reference.util';

describe('resolveInboundEmailMessageReference', () => {
  it('should pass through source and reference payloads', () => {
    expect(
      resolveInboundEmailMessageReference({
        source: 'SES_S3',
        reference: 'raw/object-key',
        envelopeRecipients: ['ch_abc@groups.example.com'],
      }),
    ).toEqual({ source: 'SES_S3', reference: 'raw/object-key' });
  });

  it('should normalize legacy s3Key payloads to the SES_S3 source', () => {
    expect(
      resolveInboundEmailMessageReference({
        s3Key: 'raw/legacy-key',
        envelopeRecipients: ['ch_abc@groups.example.com'],
      }),
    ).toEqual({ source: 'SES_S3', reference: 'raw/legacy-key' });
  });
});
