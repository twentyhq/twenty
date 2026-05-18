import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { getConnectedImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/get-connected-imap-smtp-caldav-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const OWNER_ID = WORKSPACE_MEMBER_DATA_SEED_IDS.JANE;

const createAccount = async (handle: string) => {
  const { data } = await saveImapSmtpCaldavAccount({
    expectToFail: false,
    input: {
      accountOwnerId: OWNER_ID,
      handle,
      connectionParameters: {
        IMAP: {
          host: 'imap.example.com',
          port: 993,
          username: 'user@example.com',
          password: 'test-password',
          secure: true,
        },
        SMTP: {
          host: 'smtp.example.com',
          port: 465,
          username: 'user@example.com',
          password: 'test-password',
          secure: true,
        },
      },
    },
  });

  return data.connectedAccountId as string;
};

describe('Successful save IMAP/SMTP/CALDAV account', () => {
  const accountIdsToCleanup: string[] = [];

  afterAll(async () => {
    for (const id of accountIdsToCleanup) {
      await deleteConnectedAccount({ id, expectToFail: false });
    }
  });

  it('should create a connected account with IMAP and SMTP connection parameters', async () => {
    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        accountOwnerId: OWNER_ID,
        handle: 'test-create@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            username: 'user@example.com',
            password: 'test-password',
            secure: true,
          },
          SMTP: {
            host: 'smtp.example.com',
            port: 465,
            username: 'user@example.com',
            password: 'test-password',
            secure: true,
          },
        },
      },
    });

    expect(data).toEqual({
      success: true,
      connectedAccountId: expect.any(String),
    });

    accountIdsToCleanup.push(data.connectedAccountId);

    const account = await getConnectedImapSmtpCaldavAccount({
      id: data.connectedAccountId,
    });

    expect(account.connectionParameters).toEqual({
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        username: 'user@example.com',
        secure: true,
      },
      SMTP: {
        host: 'smtp.example.com',
        port: 465,
        username: 'user@example.com',
        secure: true,
      },
      CALDAV: null,
    });
  });

  it('should update connection parameters without providing password', async () => {
    const accountId = await createAccount('test-update-no-pwd@example.com');

    accountIdsToCleanup.push(accountId);

    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        accountOwnerId: OWNER_ID,
        handle: 'test-update-no-pwd@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap-updated.example.com',
            port: 993,
            username: 'updated-user@example.com',
            secure: true,
          },
          SMTP: {
            host: 'smtp-updated.example.com',
            port: 587,
            username: 'updated-user@example.com',
            secure: false,
          },
        },
        id: accountId,
      },
    });

    expect(data).toEqual({
      success: true,
      connectedAccountId: accountId,
    });

    const account = await getConnectedImapSmtpCaldavAccount({ id: accountId });

    expect(account.connectionParameters).toEqual({
      IMAP: {
        host: 'imap-updated.example.com',
        port: 993,
        username: 'updated-user@example.com',
        secure: true,
      },
      SMTP: {
        host: 'smtp-updated.example.com',
        port: 587,
        username: 'updated-user@example.com',
        secure: false,
      },
      CALDAV: null,
    });
  });

  it('should update only the password when other fields stay the same', async () => {
    const accountId = await createAccount('test-update-pwd@example.com');

    accountIdsToCleanup.push(accountId);

    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        accountOwnerId: OWNER_ID,
        handle: 'test-update-pwd@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            username: 'user@example.com',
            password: 'new-password',
            secure: true,
          },
          SMTP: {
            host: 'smtp.example.com',
            port: 465,
            username: 'user@example.com',
            password: 'new-password',
            secure: true,
          },
        },
        id: accountId,
      },
    });

    expect(data).toEqual({
      success: true,
      connectedAccountId: accountId,
    });

    const account = await getConnectedImapSmtpCaldavAccount({ id: accountId });

    expect(account.connectionParameters).toEqual({
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        username: 'user@example.com',
        secure: true,
      },
      SMTP: {
        host: 'smtp.example.com',
        port: 465,
        username: 'user@example.com',
        secure: true,
      },
      CALDAV: null,
    });
  });

  it('should remove SMTP when updating with only IMAP', async () => {
    const accountId = await createAccount('test-remove-smtp@example.com');

    accountIdsToCleanup.push(accountId);

    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        accountOwnerId: OWNER_ID,
        handle: 'test-remove-smtp@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap.example.com',
            port: 993,
            username: 'user@example.com',
            password: 'test-password',
            secure: true,
          },
        },
        id: accountId,
      },
    });

    expect(data).toEqual({
      success: true,
      connectedAccountId: accountId,
    });

    const account = await getConnectedImapSmtpCaldavAccount({ id: accountId });

    expect(account.connectionParameters).toEqual({
      IMAP: {
        host: 'imap.example.com',
        port: 993,
        username: 'user@example.com',
        secure: true,
      },
      SMTP: null,
      CALDAV: null,
    });
  });
});
