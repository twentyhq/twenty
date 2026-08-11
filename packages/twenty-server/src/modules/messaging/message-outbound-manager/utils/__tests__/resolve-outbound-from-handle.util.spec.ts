import { resolveOutboundFromHandle } from 'src/modules/messaging/message-outbound-manager/utils/resolve-outbound-from-handle.util';

const connectedAccount = {
  handle: 'primary@holdco.com',
  handleAliases: ['Sales@company.com', 'support@company.com'],
};

describe('resolveOutboundFromHandle', () => {
  it('should return undefined when no sender is requested, letting the caller keep its default', () => {
    expect(
      resolveOutboundFromHandle({ connectedAccount, requestedFromHandle: '' }),
    ).toBeUndefined();

    expect(resolveOutboundFromHandle({ connectedAccount })).toBeUndefined();
  });

  it('should accept the connected account handle itself', () => {
    expect(
      resolveOutboundFromHandle({
        connectedAccount,
        requestedFromHandle: 'primary@holdco.com',
      }),
    ).toBe('primary@holdco.com');
  });

  it('should accept a verified alias and return it as the provider spells it', () => {
    expect(
      resolveOutboundFromHandle({
        connectedAccount,
        requestedFromHandle: '  sales@COMPANY.com ',
      }),
    ).toBe('Sales@company.com');
  });

  it('should reject an address the account has not verified', () => {
    expect(() =>
      resolveOutboundFromHandle({
        connectedAccount,
        requestedFromHandle: 'ceo@competitor.com',
      }),
    ).toThrow('is not the connected account handle nor one of its verified');
  });

  it('should reject any alias when the account has none', () => {
    expect(() =>
      resolveOutboundFromHandle({
        connectedAccount: { handle: 'primary@holdco.com', handleAliases: null },
        requestedFromHandle: 'sales@company.com',
      }),
    ).toThrow();
  });
});
