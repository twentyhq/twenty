import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { getConnectedImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/get-connected-imap-smtp-caldav-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

const createAccount = async (handle: string): Promise<string> => {
  const { data } = await saveImapSmtpCaldavAccount({
    expectToFail: false,
    input: {
      handle,
      connectionParameters: {
        IMAP: {
          host: 'imap.fastmail.com',
          port: 993,
          username: 'user@example.com',
          password: 'test-password',
          connectionSecurity: EmailConnectionSecurity.SSL_TLS,
        },
        SMTP: {
          host: 'smtp.fastmail.com',
          port: 465,
          username: 'user@example.com',
          password: 'test-password',
          connectionSecurity: EmailConnectionSecurity.SSL_TLS,
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

  it('should create a connected account with IMAP and SMTP', async () => {
    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        handle: 'test-create@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap.fastmail.com',
            port: 993,
            username: 'user@example.com',
            password: 'test-password',
            connectionSecurity: EmailConnectionSecurity.SSL_TLS,
          },
          SMTP: {
            host: 'smtp.fastmail.com',
            port: 465,
            username: 'user@example.com',
            password: 'test-password',
            connectionSecurity: EmailConnectionSecurity.SSL_TLS,
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
        host: 'imap.fastmail.com',
        port: 993,
        username: 'user@example.com',
        connectionSecurity: EmailConnectionSecurity.SSL_TLS,
      },
      SMTP: {
        host: 'smtp.fastmail.com',
        port: 465,
        username: 'user@example.com',
        connectionSecurity: EmailConnectionSecurity.SSL_TLS,
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
        handle: 'test-update-no-pwd@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap-updated.fastmail.com',
            port: 993,
            username: 'updated-user@example.com',
            connectionSecurity: EmailConnectionSecurity.SSL_TLS,
          },
          SMTP: {
            host: 'smtp-updated.fastmail.com',
            port: 587,
            username: 'updated-user@example.com',
            connectionSecurity: EmailConnectionSecurity.STARTTLS,
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
        host: 'imap-updated.fastmail.com',
        port: 993,
        username: 'updated-user@example.com',
        connectionSecurity: EmailConnectionSecurity.SSL_TLS,
      },
      SMTP: {
        host: 'smtp-updated.fastmail.com',
        port: 587,
        username: 'updated-user@example.com',
        connectionSecurity: EmailConnectionSecurity.STARTTLS,
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
        handle: 'test-remove-smtp@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap.fastmail.com',
            port: 993,
            username: 'user@example.com',
            password: 'test-password',
            connectionSecurity: EmailConnectionSecurity.SSL_TLS,
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
        host: 'imap.fastmail.com',
        port: 993,
        username: 'user@example.com',
        connectionSecurity: EmailConnectionSecurity.SSL_TLS,
      },
      SMTP: null,
      CALDAV: null,
    });
  });

  it('should update only the password when other fields stay the same', async () => {
    const accountId = await createAccount('test-update-pwd@example.com');

    accountIdsToCleanup.push(accountId);

    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        handle: 'test-update-pwd@example.com',
        connectionParameters: {
          IMAP: {
            host: 'imap.fastmail.com',
            port: 993,
            username: 'user@example.com',
            password: 'new-password',
            connectionSecurity: EmailConnectionSecurity.SSL_TLS,
          },
          SMTP: {
            host: 'smtp.fastmail.com',
            port: 465,
            username: 'user@example.com',
            password: 'new-password',
            connectionSecurity: EmailConnectionSecurity.SSL_TLS,
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
        host: 'imap.fastmail.com',
        port: 993,
        username: 'user@example.com',
        connectionSecurity: EmailConnectionSecurity.SSL_TLS,
      },
      SMTP: {
        host: 'smtp.fastmail.com',
        port: 465,
        username: 'user@example.com',
        connectionSecurity: EmailConnectionSecurity.SSL_TLS,
      },
      CALDAV: null,
    });
  });
});
