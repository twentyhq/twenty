import {
  ConnectedAccountProvider,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-visibility-multi@apple.dev';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

const THREAD_TOKEN = 'visibility-multi';

describe('Message channel visibility across a multi message page (integration)', () => {
  const inbox = [
    gmailMessage({ from: `first-${THREAD_TOKEN}@example.com` }),
    gmailMessage({ from: `second-${THREAD_TOKEN}@example.com` }),
    gmailMessage({ from: `third-${THREAD_TOKEN}@example.com` }),
  ];
  const subjects = inbox.map(getGmailMessageSubject);

  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const readMessagesAs = async (
    makeRequest:
      | typeof makeGraphqlAPIRequest
      | typeof makeGraphqlAPIRequestWithMemberRole,
  ) => {
    const response = await makeRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'subject text',
        filter: { subject: { in: subjects } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.messages.edges.map(
      (edge: { node: { subject: string; text: string } }) => edge.node,
    );
  };

  const setVisibility = async (visibility: MessageChannelVisibility) => {
    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      { visibility },
    );
  };

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

  it('returns every message unmasked to another member when the channel shares everything', async () => {
    await setVisibility(MessageChannelVisibility.SHARE_EVERYTHING);

    const messages = await readMessagesAs(makeGraphqlAPIRequestWithMemberRole);

    expect(messages).toHaveLength(subjects.length);
    expect(
      messages.map((message: { subject: string }) => message.subject).sort(),
    ).toEqual([...subjects].sort());
    for (const message of messages) {
      expect(message.text).not.toBe(RESTRICTED);
    }
  });

  it('masks the body of every message on the page under subject visibility', async () => {
    await setVisibility(MessageChannelVisibility.SUBJECT);

    const messages = await readMessagesAs(makeGraphqlAPIRequestWithMemberRole);

    expect(messages).toHaveLength(subjects.length);
    for (const message of messages) {
      expect(subjects).toContain(message.subject);
      expect(message.text).toBe(RESTRICTED);
    }
  });

  it('masks the subject and body of every message on the page under metadata visibility', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const messages = await readMessagesAs(makeGraphqlAPIRequestWithMemberRole);

    expect(messages).toHaveLength(subjects.length);
    for (const message of messages) {
      expect(message.subject).toBe(RESTRICTED);
      expect(message.text).toBe(RESTRICTED);
    }
  });

  it('returns every message unmasked to the connected account owner under metadata visibility', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const messages = await readMessagesAs(makeGraphqlAPIRequest);

    expect(messages).toHaveLength(subjects.length);
    expect(
      messages.map((message: { subject: string }) => message.subject).sort(),
    ).toEqual([...subjects].sort());
    for (const message of messages) {
      expect(message.text).not.toBe(RESTRICTED);
    }
  });
});
