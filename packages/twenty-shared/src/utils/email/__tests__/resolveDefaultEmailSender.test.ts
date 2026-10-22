import { ConnectedAccountProvider } from '@/types';
import {
  type DefaultEmailSenderAccount,
  resolveDefaultEmailSender,
} from '@/utils/email/resolveDefaultEmailSender';

const accountA: DefaultEmailSenderAccount = {
  id: 'account-a',
  provider: ConnectedAccountProvider.GOOGLE,
  handle: 'michael@mwoodworth.com',
  handleAliases: ['michael@getindexed.ai', 'michael@pageweaver.ai'],
};

const accountB: DefaultEmailSenderAccount = {
  id: 'account-b',
  provider: ConnectedAccountProvider.GOOGLE,
  handle: 'ops@getindexed.ai',
  handleAliases: null,
};

describe('resolveDefaultEmailSender', () => {
  it('prefers the personal handle, spelled as stored', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountA, accountB],
        personalFromHandle: 'MICHAEL@pageweaver.ai',
        workspaceSenderDomain: 'getindexed.ai',
      }),
    ).toEqual({
      connectedAccountId: 'account-a',
      fromHandle: 'michael@pageweaver.ai',
    });
  });

  it('falls back to the domain when the personal handle is stale, in account then handle order', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountA, accountB],
        personalFromHandle: 'gone@x.com',
        workspaceSenderDomain: 'getindexed.ai',
      }),
    ).toEqual({
      connectedAccountId: 'account-a',
      fromHandle: 'michael@getindexed.ai',
    });
  });

  it('matches a handle on the domain', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [accountB],
        personalFromHandle: null,
        workspaceSenderDomain: 'getindexed.ai',
      }),
    ).toEqual({
      connectedAccountId: 'account-b',
      fromHandle: 'ops@getindexed.ai',
    });
  });

  it.each(['x@getindexed.ai.evil.com', 'x@mail.getindexed.ai'])(
    'does not match %s against the domain',
    (handle) => {
      expect(
        resolveDefaultEmailSender({
          accounts: [{ ...accountB, handle }],
          personalFromHandle: null,
          workspaceSenderDomain: 'getindexed.ai',
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
        workspaceSenderDomain: 'pageweaver.ai',
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
        workspaceSenderDomain: 'getindexed.ai',
        restrictToConnectedAccountId: 'account-b',
      }),
    ).toEqual({
      connectedAccountId: 'account-b',
      fromHandle: 'ops@getindexed.ai',
    });

    expect(
      resolveDefaultEmailSender({
        accounts,
        personalFromHandle: 'gone@x.com',
        workspaceSenderDomain: 'pageweaver.ai',
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
            handle: 'primary@getindexed.ai',
            handleAliases: ['alias@getindexed.ai'],
          },
        ],
        personalFromHandle: null,
        workspaceSenderDomain: 'getindexed.ai',
      }),
    ).toEqual({
      connectedAccountId: 'account-a',
      fromHandle: 'primary@getindexed.ai',
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
        personalFromHandle: 'ops@getindexed.ai',
        workspaceSenderDomain: 'getindexed.ai',
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
        personalFromHandle: 'ops@getindexed.ai',
        workspaceSenderDomain: 'getindexed.ai',
      }),
    ).toBeNull();
  });

  it('never matches a handle without an @ against the workspace domain', () => {
    expect(
      resolveDefaultEmailSender({
        accounts: [
          { ...accountB, handle: 'getindexed.ai', handleAliases: null },
        ],
        personalFromHandle: null,
        workspaceSenderDomain: 'getindexed.ai',
      }),
    ).toBeNull();
  });
});
