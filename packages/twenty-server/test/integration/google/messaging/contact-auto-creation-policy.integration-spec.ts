import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findCreatedPeopleEmails } from 'test/integration/utils/find-created-people.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-contact-policy@apple.dev';

const gmailMessageBetween = ({
  from,
  to,
}: {
  from: string;
  to: string;
}): gmail_v1.Schema$Message => {
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
        { name: 'To', value: to },
        { name: 'Subject', value: `Subject ${id}` },
        { name: 'Message-ID', value: `<${id}@example.com>` },
        { name: 'Date', value: 'Wed, 15 Nov 2023 00:00:00 +0000' },
      ],
      body: { data: Buffer.from(`body ${id}`).toString('base64'), size: 10 },
    },
  };
};

describe('Gmail contact auto-creation policy (integration)', () => {
  const inbox: gmail_v1.Schema$Message[] = [];

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const syncConversationWith = async ({
    inboundSender,
    outboundRecipient,
    channelSettings,
  }: {
    inboundSender: string;
    outboundRecipient: string;
    channelSettings: Pick<
      MessageChannelEntity,
      | 'contactAutoCreationPolicy'
      | 'excludeGroupEmails'
      | 'excludeNonProfessionalEmails'
    > &
      Partial<Pick<MessageChannelEntity, 'isContactAutoCreationEnabled'>>;
  }) => {
    const messages = [
      gmailMessageBetween({ from: inboundSender, to: HANDLE }),
      gmailMessageBetween({ from: HANDLE, to: outboundRecipient }),
    ];

    inbox.push(...messages);
    gmail.serveMessageList(messages);

    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      channelSettings,
    );

    await resetMessageChannelSyncState(channel.channelId, '');

    await runMessageChannelSync(channel.channelId);

    return findCreatedPeopleEmails([inboundSender, outboundRecipient]);
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('creates no contact when the policy is NONE', async () => {
    const inboundSender = `inbound-none-${randomUUID()}@acme.com`;
    const outboundRecipient = `outbound-none-${randomUUID()}@acme.com`;

    expect(
      await syncConversationWith({
        inboundSender,
        outboundRecipient,
        channelSettings: {
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.NONE,
          excludeGroupEmails: false,
          excludeNonProfessionalEmails: false,
        },
      }),
    ).toEqual([]);
  }, 60000);

  it('creates only the recipient of a sent message when the policy is SENT', async () => {
    const inboundSender = `inbound-sent-${randomUUID()}@acme.com`;
    const outboundRecipient = `outbound-sent-${randomUUID()}@acme.com`;

    expect(
      await syncConversationWith({
        inboundSender,
        outboundRecipient,
        channelSettings: {
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.SENT,
          excludeGroupEmails: false,
          excludeNonProfessionalEmails: false,
        },
      }),
    ).toEqual([outboundRecipient]);
  }, 60000);

  it('creates both sides when the policy is SENT_AND_RECEIVED', async () => {
    const inboundSender = `inbound-both-${randomUUID()}@acme.com`;
    const outboundRecipient = `outbound-both-${randomUUID()}@acme.com`;

    expect(
      await syncConversationWith({
        inboundSender,
        outboundRecipient,
        channelSettings: {
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
          excludeGroupEmails: false,
          excludeNonProfessionalEmails: false,
        },
      }),
    ).toEqual([inboundSender, outboundRecipient].sort());
  }, 60000);

  it('creates no contact when auto-creation is disabled on the channel', async () => {
    const inboundSender = `inbound-disabled-${randomUUID()}@acme.com`;
    const outboundRecipient = `outbound-disabled-${randomUUID()}@acme.com`;

    expect(
      await syncConversationWith({
        inboundSender,
        outboundRecipient,
        channelSettings: {
          isContactAutoCreationEnabled: false,
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
          excludeGroupEmails: false,
          excludeNonProfessionalEmails: false,
        },
      }),
    ).toEqual([]);
  }, 60000);

  it('skips group email addresses when they are excluded', async () => {
    const inboundSender = `contact@acme-${randomUUID()}.com`;
    const outboundRecipient = `outbound-group-${randomUUID()}@acme.com`;

    expect(
      await syncConversationWith({
        inboundSender,
        outboundRecipient,
        channelSettings: {
          isContactAutoCreationEnabled: true,
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
          excludeGroupEmails: true,
          excludeNonProfessionalEmails: false,
        },
      }),
    ).toEqual([outboundRecipient]);
  }, 60000);

  it('skips non-professional email addresses when they are excluded', async () => {
    const inboundSender = `inbound-personal-${randomUUID()}@gmail.com`;
    const outboundRecipient = `outbound-work-${randomUUID()}@acme.com`;

    expect(
      await syncConversationWith({
        inboundSender,
        outboundRecipient,
        channelSettings: {
          isContactAutoCreationEnabled: true,
          contactAutoCreationPolicy:
            MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
          excludeGroupEmails: false,
          excludeNonProfessionalEmails: true,
        },
      }),
    ).toEqual([outboundRecipient]);
  }, 60000);
});
