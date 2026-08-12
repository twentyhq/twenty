import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

import {
  ConnectedAccountProvider,
  MessageChannelPendingGroupEmailsAction,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-pending-group-emails@apple.dev';

const gmailMessageFrom = (from: string): gmail_v1.Schema$Message => {
  const id = `gmail-msg-${randomUUID()}`;

  return {
    id,
    threadId: id,
    historyId: '987654321',
    internalDate: '1700000000000',
    labelIds: ['INBOX'],
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: from },
        { name: 'To', value: HANDLE },
        { name: 'Subject', value: `Subject ${id}` },
        { name: 'Message-ID', value: `<${id}@example.com>` },
        { name: 'Date', value: 'Wed, 15 Nov 2023 00:00:00 +0000' },
      ],
      body: { data: Buffer.from(`body ${id}`).toString('base64'), size: 10 },
    },
  };
};

describe('Message channel pending group emails action (integration)', () => {
  const groupMessage = gmailMessageFrom(`noreply-${randomUUID()}@acme.com`);
  const directMessage = gmailMessageFrom(`person-${randomUUID()}@acme.com`);

  const groupSubject = getGmailMessageSubject(groupMessage);
  const directSubject = getGmailMessageSubject(directMessage);

  setupGoogleMock({
    handle: HANDLE,
    inbox: [groupMessage, directMessage],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const messageChannelRepository =
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

  const setPendingAction = async (
    pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction,
  ) => {
    await messageChannelRepository.update(
      { id: channel.channelId },
      { pendingGroupEmailsAction, syncCursor: 'group-action-cursor' },
    );
  };

  const readChannel = () =>
    messageChannelRepository.findOneByOrFail({ id: channel.channelId });

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
  }, 120000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('leaves the channel alone when no group emails action is pending', async () => {
    await setPendingAction(MessageChannelPendingGroupEmailsAction.NONE);

    await runMessageChannelSync(channel.channelId);

    const channelState = await readChannel();

    expect(channelState.pendingGroupEmailsAction).toBe(
      MessageChannelPendingGroupEmailsAction.NONE,
    );
    expect(
      await findImportedMessageSubjects([groupSubject, directSubject]),
    ).toEqual([groupSubject, directSubject].sort());
  }, 120000);

  it('clears the cursors and the pending action on a group emails import', async () => {
    await setPendingAction(
      MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await readChannel();

    expect(channelState.pendingGroupEmailsAction).toBe(
      MessageChannelPendingGroupEmailsAction.NONE,
    );
    expect(
      await findImportedMessageSubjects([groupSubject, directSubject]),
    ).toEqual([groupSubject, directSubject].sort());
  }, 120000);

  it('deletes only the group email messages on a group emails deletion', async () => {
    await setPendingAction(
      MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION,
    );

    await runMessageChannelSync(channel.channelId);

    const channelState = await readChannel();

    expect(channelState.pendingGroupEmailsAction).toBe(
      MessageChannelPendingGroupEmailsAction.NONE,
    );
    expect(
      await findImportedMessageSubjects([groupSubject, directSubject]),
    ).toEqual([directSubject]);
  }, 120000);
});
