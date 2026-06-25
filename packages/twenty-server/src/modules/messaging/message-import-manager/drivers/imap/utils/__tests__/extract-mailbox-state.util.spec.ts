import { type ImapFlow } from 'imapflow';

import { resolveMailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';

type MockClient = {
  status: jest.Mock;
  search: jest.Mock;
};

const createClient = (): MockClient => ({
  status: jest.fn(),
  search: jest.fn(),
});

const asImapFlow = (client: MockClient) => client as unknown as ImapFlow;

const createMailbox = (
  overrides: Partial<NonNullable<ImapFlow['mailbox']>> = {},
) =>
  ({
    uidValidity: 100n,
    uidNext: 51,
    highestModseq: 9n,
    ...overrides,
  }) as NonNullable<ImapFlow['mailbox']>;

describe('resolveMailboxState', () => {
  it('uses the SELECT uidNext without extra round-trips when the server provides it', async () => {
    const client = createClient();

    const state = await resolveMailboxState(
      asImapFlow(client),
      'INBOX',
      createMailbox({ uidNext: 51 }),
    );

    expect(state).toEqual({
      uidValidity: 100,
      uidNext: 51,
      maxUid: 50,
      highestModSeq: 9n,
    });
    expect(client.status).not.toHaveBeenCalled();
    expect(client.search).not.toHaveBeenCalled();
  });

  it('falls back to STATUS when the server omits uidNext on SELECT', async () => {
    const client = createClient();

    client.status.mockResolvedValue({ uidNext: 71 });

    const state = await resolveMailboxState(
      asImapFlow(client),
      'INBOX',
      createMailbox({ uidNext: undefined }),
    );

    expect(client.status).toHaveBeenCalledWith('INBOX', { uidNext: true });
    expect(client.search).not.toHaveBeenCalled();
    expect(state.uidNext).toBe(71);
    expect(state.maxUid).toBe(70);
  });

  it('falls back to the highest live UID when both SELECT and STATUS omit uidNext', async () => {
    const client = createClient();

    client.status.mockResolvedValue({ uidNext: 0 });
    client.search.mockResolvedValue([3, 41, 17]);

    const state = await resolveMailboxState(
      asImapFlow(client),
      'INBOX',
      createMailbox({ uidNext: undefined }),
    );

    expect(client.search).toHaveBeenCalledWith({ uid: '1:*' }, { uid: true });
    expect(state.uidNext).toBe(42);
    expect(state.maxUid).toBe(41);
  });

  it('treats an empty mailbox as uidNext 1 when no UID source is available', async () => {
    const client = createClient();

    client.status.mockResolvedValue({});
    client.search.mockResolvedValue([]);

    const state = await resolveMailboxState(
      asImapFlow(client),
      'INBOX',
      createMailbox({ uidNext: undefined }),
    );

    expect(state.uidNext).toBe(1);
    expect(state.maxUid).toBe(0);
  });

  it('throws when the mailbox is not selected', async () => {
    const client = createClient();

    await expect(
      resolveMailboxState(
        asImapFlow(client),
        'INBOX',
        true as unknown as NonNullable<ImapFlow['mailbox']>,
      ),
    ).rejects.toThrow('Invalid mailbox state');
  });
});
