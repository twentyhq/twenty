import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { connectGreenmailImapAccount } from 'test/integration/utils/connect-greenmail-imap-account.util';
import { queryMessageFolders } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { type GreenmailServer } from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';

// GreenMail registers a declared user under the local part of its address, so
// that is the login, while the channel keeps the full address as its handle.
const HANDLE = `imap-folder-discovery-${randomUUID()}@acme.test`;

describe('IMAP folder discovery (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  beforeAll(async () => {
    ({ greenmail, connectedAccountId, messageChannelId } =
      await connectGreenmailImapAccount({
        handle: HANDLE,
        password: PASSWORD,
      }));
  }, 300000);

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: true },
    }).catch(() => undefined);

    if (isNonEmptyString(connectedAccountId)) {
      await deleteConnectedAccount({
        id: connectedAccountId,
        expectToFail: false,
      }).catch(() => undefined);
    }

    await greenmail?.stop().catch(() => undefined);
  });

  it('discovers the mailboxes exposed by the IMAP server', async () => {
    await runMessageChannelSync(messageChannelId);

    const folders = await queryMessageFolders(messageChannelId);

    expect(folders.map((folder) => folder.name)).toContain('INBOX');
  }, 300000);
});
