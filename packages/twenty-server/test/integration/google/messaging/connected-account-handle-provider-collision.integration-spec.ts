  import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { saveImapSmtpCaldavAccount } from 'test/integration/metadata/suites/connected-account/utils/save-imap-smtp-caldav-account.util';
import { queryCalendarChannels } from 'test/integration/utils/query-messaging.util';

import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';

const HANDLE = 'shared-handle-collision@example.com';

type ConnectedAccountNode = {
  id: string;
  handle: string;
  provider: ConnectedAccountProvider;
};

const findConnectedAccountsByHandle = (handle: string) =>
  findRecordNodesByFilter<ConnectedAccountNode>(
    'connectedAccount',
    'connectedAccounts',
    `id
      handle
      provider`,
    { handle: { eq: handle } },
  );

describe('Connected account handle/provider collision (integration)', () => {
  setupGoogleMock({ handle: HANDLE, inbox: [] });

  let googleAccountId: string;
  let imapAccountId: string | undefined;
  let googleCleanup: (() => Promise<void>) | undefined;

  beforeAll(async () => {
    const googleAccount = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    googleAccountId = googleAccount.connectedAccountId;
    googleCleanup = googleAccount.cleanup;
  }, 60000);

  afterAll(async () => {
    if (imapAccountId) {
      await deleteConnectedAccount({ id: imapAccountId, expectToFail: false });
    }
    await googleCleanup?.().catch(() => undefined);
  });

  it('creates a separate row for an IMAP account sharing a Google handle instead of overriding it', async () => {
    const { data } = await saveImapSmtpCaldavAccount({
      expectToFail: false,
      input: {
        handle: HANDLE,
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

    imapAccountId = data.connectedAccountId;

    expect(imapAccountId).toEqual(expect.any(String));
    expect(imapAccountId).not.toEqual(googleAccountId);

    const connectedAccounts = await findConnectedAccountsByHandle(HANDLE);

    const googleRow = connectedAccounts.find(
      (account) => account.id === googleAccountId,
    );
    const imapRow = connectedAccounts.find(
      (account) => account.id === imapAccountId,
    );

    expect(googleRow?.provider).toEqual(ConnectedAccountProvider.GOOGLE);
    expect(imapRow?.provider).toEqual(
      ConnectedAccountProvider.IMAP_SMTP_CALDAV,
    );

    const googleCalendarChannels = await queryCalendarChannels(googleAccountId);

    expect(googleCalendarChannels).not.toHaveLength(0);
  }, 60000);
});
