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

  it('should prefer the parent-derived thread id over inReplyTo so IMAP/SMTP replies attach to the original thread root, not the immediate parent', () => {
    const result = resolveOutboundThreadExternalId({
      sendResult: {
        headerMessageId: '<reply@mail.example>',
        messageExternalId: undefined,
        threadExternalId: undefined,
      },
      parentThreadExternalId: '<root@mail.example>',
      inReplyTo: '<parent@mail.example>',
    });

    expect(result).toBe('<root@mail.example>');
  });

  it('should fall back to inReplyTo when the parent is unknown locally so the reply still anchors on the parent Message-ID per RFC 5322', () => {
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
