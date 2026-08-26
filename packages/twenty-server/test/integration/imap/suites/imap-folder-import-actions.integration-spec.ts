import { randomUUID } from 'node:crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

import { deleteConnectedAccount } from 'test/integration/metadata/suites/connected-account/utils/delete-connected-account.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { connectGreenmailImapAccount } from 'test/integration/utils/connect-greenmail-imap-account.util';
import { deliverMailOverSmtp } from 'test/integration/utils/deliver-mail-over-smtp.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import {
  type MessageFolderDto,
  queryMessageFolders,
} from 'test/integration/utils/query-messaging.util';
import {
  FOLDER_ACTION_NAMES,
  MESSAGE_COUNT_ABOVE_V8_SPREAD_ARGUMENT_LIMIT,
  runFolderActions,
  runFolderActionsWithoutPendingActions,
} from 'test/integration/utils/run-folder-actions.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { type GreenmailServer } from 'test/integration/utils/start-greenmail-container.util';

const PASSWORD = 'greenmail-password';
const HANDLE = `imap-folder-actions-${randomUUID()}@acme.test`;
const DELETED_FOLDER_NAME = 'INBOX';
const IMPORTED_SUBJECT = `IMAP inbox message ${randomUUID()}`;

describe('IMAP folder actions (integration)', () => {
  let greenmail: GreenmailServer;
  let connectedAccountId: string;
  let messageExternalIdsToImport: string[];
  let messageExternalIdsWithoutPendingActions: string[];
  let folders: MessageFolderDto[];
  let subjectsBeforeFolderDeletion: string[];
  let subjectsAfterFolderDeletion: string[];

  beforeAll(async () => {
    const account = await connectGreenmailImapAccount({
      handle: HANDLE,
      password: PASSWORD,
    });

    greenmail = account.greenmail;
    connectedAccountId = account.connectedAccountId;

    await deliverMailOverSmtp({
      host: greenmail.host,
      port: greenmail.smtpPort,
      from: `sender-${randomUUID()}@external.test`,
      to: HANDLE,
      subject: IMPORTED_SUBJECT,
    });

    await runMessageChannelSync(account.messageChannelId);

    subjectsBeforeFolderDeletion = await findImportedMessageSubjects([
      IMPORTED_SUBJECT,
    ]);

    messageExternalIdsToImport = await runFolderActions({
      messageChannelId: account.messageChannelId,
      folderNameToDelete: DELETED_FOLDER_NAME,
    });

    subjectsAfterFolderDeletion = await findImportedMessageSubjects([
      IMPORTED_SUBJECT,
    ]);
    folders = await queryMessageFolders(account.messageChannelId);

    messageExternalIdsWithoutPendingActions =
      await runFolderActionsWithoutPendingActions(account.messageChannelId);
  }, 300000);

  afterAll(async () => {
    jest.restoreAllMocks();

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

  it('imports every message id of a folder larger than the spread-argument limit, deduplicated', () => {
    expect(messageExternalIdsToImport).toHaveLength(
      MESSAGE_COUNT_ABOVE_V8_SPREAD_ARGUMENT_LIMIT,
    );
  });

  it('clears the pending action it processed, keeps the one it failed on, and drops the deleted folder', () => {
    expect(
      Object.fromEntries(
        folders.map((folder) => [folder.name, folder.pendingSyncAction]),
      ),
    ).toEqual({
      [FOLDER_ACTION_NAMES.imported]: MessageFolderPendingSyncAction.NONE,
      [FOLDER_ACTION_NAMES.failing]:
        MessageFolderPendingSyncAction.FOLDER_IMPORT,
      [FOLDER_ACTION_NAMES.untouched]: MessageFolderPendingSyncAction.NONE,
    });
  });

  it('deletes the messages of the folder marked for deletion', () => {
    expect(subjectsBeforeFolderDeletion).toEqual([IMPORTED_SUBJECT]);
    expect(subjectsAfterFolderDeletion).toEqual([]);
  });

  it('imports nothing when no folder carries a pending action', () => {
    expect(messageExternalIdsWithoutPendingActions).toEqual([]);
  });
});
