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

const HANDLE = 'gmail-channel-visibility@apple.dev';

const RESTRICTED = FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED;

describe('Message channel visibility (integration)', () => {
  const inbox = [gmailMessage()];
  const subject = getGmailMessageSubject(inbox[0]);

  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const messageQuery = () =>
    findManyOperationFactory({
      objectMetadataSingularName: 'message',
      objectMetadataPluralName: 'messages',
      gqlFields: 'subject text',
      filter: { subject: { eq: subject } },
    });

  const readMessageAs = async (
    makeRequest:
      | typeof makeGraphqlAPIRequest
      | typeof makeGraphqlAPIRequestWithMemberRole,
  ) => {
    const response = await makeRequest(messageQuery());

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

  it('shows the full message to another member when the channel shares everything', async () => {
    await setVisibility(MessageChannelVisibility.SHARE_EVERYTHING);

    const [message] = await readMessageAs(makeGraphqlAPIRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBe(RESTRICTED);
  }, 60000);

  it('masks the body but keeps the subject for another member under subject visibility', async () => {
    await setVisibility(MessageChannelVisibility.SUBJECT);

    const [message] = await readMessageAs(makeGraphqlAPIRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).toBe(RESTRICTED);
  }, 60000);

  it('masks both the subject and the body for another member under metadata visibility', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessageAs(makeGraphqlAPIRequestWithMemberRole);

    expect(message.subject).toBe(RESTRICTED);
    expect(message.text).toBe(RESTRICTED);
  }, 60000);

  it('always shows the full message to the owner of the connected account', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessageAs(makeGraphqlAPIRequest);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBe(RESTRICTED);
  }, 60000);
});
