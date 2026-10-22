import { ConnectedAccountProvider } from '@/types';
import { canConnectedAccountSendEmail } from '@/utils/email/canConnectedAccountSendEmail';

describe('canConnectedAccountSendEmail', () => {
  it('accepts an active account that can send', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.GOOGLE,
        archivedAt: null,
      }),
    ).toBe(true);
  });

  it('rejects an archived account', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.GOOGLE,
        archivedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toBe(false);
  });

  it('rejects an account without send capability', () => {
    expect(
      canConnectedAccountSendEmail({
        provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        connectionParameters: null,
      }),
    ).toBe(false);
  });
});
