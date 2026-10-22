import { ConnectedAccountProvider } from '@/types';
import { resolveDefaultEmailSender } from '@/utils/email/resolveDefaultEmailSender';

const accountA = {
  id: 'account-a',
  provider: ConnectedAccountProvider.GOOGLE,
  handle: 'jane@example.net',
  handleAliases: ['jane@example.com', 'jane@acme.com'],
};

const accountB = {
  id: 'account-b',
  provider: ConnectedAccountProvider.GOOGLE,
  handle: 'ops@example.com',
  handleAliases: null,
};

describe('resolveDefaultEmailSender', () => {
  it('prefers the personal handle, spelled as stored', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountA, accountB],
        personalFromHandle: 'JANE@acme.com',
        workspaceSenderDomain: 'example.com',
      }),
    ).toEqual({
      connectedAccountId: 'account-a',
      fromHandle: 'jane@acme.com',
    });
  });

  it('falls back to the domain when the personal handle is stale, in account then handle order', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountA, accountB],
        personalFromHandle: 'gone@x.com',
        workspaceSenderDomain: 'example.com',
      }),
    ).toEqual({
      connectedAccountId: 'account-a',
      fromHandle: 'jane@example.com',
    });
  });

  it('matches a handle on the domain', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountB],
        personalFromHandle: null,
        workspaceSenderDomain: 'example.com',
      }),
    ).toEqual({
      connectedAccountId: 'account-b',
      fromHandle: 'ops@example.com',
    });
  });

  it.each(['x@example.com.evil.com', 'x@mail.example.com'])(
    'does not match %s against the domain',
    (handle) => {
      expect(
        resolveDefaultEmailSender({
          accounts: [{ ...accountB, handle }],
          personalFromHandle: null,
          workspaceSenderDomain: 'example.com',
        }),
      ).toBeNull();
    },
  );

  it('returns null without a personal handle or domain', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountA, accountB],
        personalFromHandle: null,
        workspaceSenderDomain: null,
      }),
    ).toBeNull();
  });

  it('never switches away from the restricted account', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountA, accountB],
        personalFromHandle: null,
        workspaceSenderDomain: 'acme.com',
        restrictToConnectedAccountId: 'account-b',
      }),
    ).toBeNull();
  });

  it('falls back to the domain within the restricted account when the personal handle is stale', () => {
    const accounts = [accountA, accountB];

    expect(
      resolveDefaultEmailSender({
        accounts,
        personalFromHandle: 'gone@x.com',
        workspaceSenderDomain: 'example.com',
        restrictToConnectedAccountId: 'account-b',
      }),
    ).toEqual({
      connectedAccountId: 'account-b',
      fromHandle: 'ops@example.com',
    });

    expect(
      resolveDefaultEmailSender({
        accounts,
        personalFromHandle: 'gone@x.com',
        workspaceSenderDomain: 'acme.com',
        restrictToConnectedAccountId: 'account-b',
      }),
    ).toBeNull();
  });

  it('prefers the handle over an alias on the same domain within one account', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [
          {
            ...accountA,
            handle: 'primary@example.com',
            handleAliases: ['alias@example.com'],
          },
        ],
        personalFromHandle: null,
        workspaceSenderDomain: 'example.com',
      }),
    ).toEqual({
      connectedAccountId: 'account-a',
      fromHandle: 'primary@example.com',
    });
  });

  it('skips accounts that cannot send', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [
          {
            ...accountB,
            provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
            connectionParameters: null,
          },
        ],
        personalFromHandle: 'ops@example.com',
        workspaceSenderDomain: 'example.com',
      }),
    ).toBeNull();
  });

  it('skips archived accounts for both personal and domain matches', () => {
    const archivedAccount = {
      ...accountB,
      archivedAt: '2026-01-01T00:00:00.000Z',
    };

    expect(
      resolveDefaultEmailSender({
        accounts: [archivedAccount],
        personalFromHandle: 'ops@example.com',
        workspaceSenderDomain: 'example.com',
      }),
    ).toBeNull();
  });
});
