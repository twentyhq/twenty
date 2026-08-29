import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { connectDovecotImapAccount } from 'test/integration/utils/connect-dovecot-imap-account.util';
import { queryMessageFolders } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { type DovecotServer } from 'test/integration/utils/start-dovecot-container.util';

const PASSWORD = 'dovecot-password';
const HANDLE = `imap-folder-discovery-${randomUUID()}@acme.test`;

describe('IMAP folder discovery (integration)', () => {
  let dovecot: DovecotServer;
  let connectedAccountId: string;
  let messageChannelId: string;

  beforeAll(async () => {
    ({ dovecot, connectedAccountId, messageChannelId } =
      await connectDovecotImapAccount({
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

    await dovecot?.stop().catch(() => undefined);
  });

  it('discovers the mailboxes exposed by the IMAP server', async () => {
    await runMessageChannelSync(messageChannelId);

    const folderNames = (await queryMessageFolders(messageChannelId)).map(
      (folder) => folder.name,
    );

    expect(folderNames).toEqual(
      expect.arrayContaining(['INBOX', 'Sent', 'Drafts']),
    );
  }, 300000);

  it('skips the mailboxes excluded from folder management', async () => {
    await runMessageChannelSync(messageChannelId);

    const folderNames = (await queryMessageFolders(messageChannelId)).map(
      (folder) => folder.name,
    );

    expect(folderNames).not.toContain('Trash');
    expect(folderNames).not.toContain('Junk');
  }, 300000);

  it('marks the special-use sent folder as the sent folder', async () => {
    await runMessageChannelSync(messageChannelId);

    const folders = await queryMessageFolders(messageChannelId);

    expect(
      folders.filter((folder) => folder.isSentFolder).map(({ name }) => name),
    ).toEqual(['Sent']);
  }, 300000);
});
