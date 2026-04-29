import { resolveOutboundThreadExternalId } from 'src/modules/messaging/message-outbound-manager/utils/resolve-outbound-thread-external-id.util';

describe('resolveOutboundThreadExternalId', () => {
  it("should prefer the provider's thread id when present", () => {
    const result = resolveOutboundThreadExternalId({
      sendResult: {
        headerMessageId: '<reply@mail.example>',
        messageExternalId: 'gmail-id',
        threadExternalId: 'gmail-thread-id',
      },
      inReplyTo: '<parent@mail.example>',
    });

    expect(result).toBe('gmail-thread-id');
  });

  it('should fall back to inReplyTo so IMAP/SMTP replies attach to the parent thread', () => {
    const result = resolveOutboundThreadExternalId({
      sendResult: {
        headerMessageId: '<reply@mail.example>',
        messageExternalId: undefined,
        threadExternalId: undefined,
      },
      inReplyTo: '<parent@mail.example>',
    });

    expect(result).toBe('<parent@mail.example>');
  });

  it('should fall back to the headerMessageId for new IMAP/SMTP sends so unrelated threads do not collide', () => {
    const result = resolveOutboundThreadExternalId({
      sendResult: {
        headerMessageId: '<msg@mail.example>',
        messageExternalId: undefined,
        threadExternalId: undefined,
      },
    });

    expect(result).toBe('<msg@mail.example>');
  });
});
