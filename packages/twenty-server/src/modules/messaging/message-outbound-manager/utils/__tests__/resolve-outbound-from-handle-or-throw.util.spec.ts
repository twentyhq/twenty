import { resolveOutboundFromHandleOrThrow } from 'src/modules/messaging/message-outbound-manager/utils/resolve-outbound-from-handle-or-throw.util';

const connectedAccount = {
  handle: 'primary@holdco.com',
  handleAliases: ['Sales@company.com', 'support@company.com'],
};

describe('resolveOutboundFromHandleOrThrow', () => {
  it('should return undefined when no sender is requested, letting the caller keep its default', () => {
    expect(
      resolveOutboundFromHandleOrThrow({
        connectedAccount,
        requestedFromHandle: '',
      }),
    ).toBeUndefined();

    expect(
      resolveOutboundFromHandleOrThrow({ connectedAccount }),
    ).toBeUndefined();
  });

  it('should accept the connected account handle itself', () => {
    expect(
      resolveOutboundFromHandleOrThrow({
        connectedAccount,
        requestedFromHandle: 'primary@holdco.com',
      }),
    ).toBe('primary@holdco.com');
  });

  it('should accept a verified alias and return it as the provider spells it', () => {
    expect(
      resolveOutboundFromHandleOrThrow({
        connectedAccount,
        requestedFromHandle: '  sales@COMPANY.com ',
      }),
    ).toBe('Sales@company.com');
  });

  it('should reject an address the account has not verified', () => {
    expect(() =>
      resolveOutboundFromHandleOrThrow({
        connectedAccount,
        requestedFromHandle: 'ceo@competitor.com',
      }),
    ).toThrow('is not the connected account handle nor one of its verified');
  });

  it('should reject any alias when the account has none', () => {
    expect(() =>
      resolveOutboundFromHandleOrThrow({
        connectedAccount: { handle: 'primary@holdco.com', handleAliases: null },
        requestedFromHandle: 'sales@company.com',
      }),
    ).toThrow();
  });
});
