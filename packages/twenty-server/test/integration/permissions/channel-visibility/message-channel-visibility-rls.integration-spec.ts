import {
  ConnectedAccountProvider,
  FeatureFlagKey,
  MessageChannelVisibility,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type ChannelVisibilityRuleSyncService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-rule-sync.service';
import { type AccessGroupSyncService } from 'src/engine/permissions/internal/access-group/services/access-group-sync.service';
import { type RecordAccessGroupComputationService } from 'src/engine/permissions/internal/access-group/services/record-access-group-computation.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'gmail-channel-visibility-rls@apple.dev';
const SENDER_HANDLE = 'gmail-channel-visibility-rls-sender@example.com';
const FLAGS = [
  FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
  FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED,
  FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
];

type MakeRequest =
  | typeof makeGraphqlApiRequest
  | typeof makeGraphqlApiRequestWithMemberRole;

describe('Message channel visibility through personal role rules (integration)', () => {
  const inbox = [gmailMessage({ from: SENDER_HANDLE })];
  const subject = getGmailMessageSubject(inbox[0]);

  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let messageId: string;

  const readMessageAs = async (makeRequest: MakeRequest) => {
    const response = await makeRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id subject text',
        filter: { id: { eq: messageId } },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.messages.edges.map(
      (edge: { node: { subject: string | null; text: string | null } }) =>
        edge.node,
    );
  };

  const syncRules = async () => {
    await getAppProviderByClassName<ChannelVisibilityRuleSyncService>(
      'ChannelVisibilityRuleSyncService',
    ).syncWorkspace(SEED_APPLE_WORKSPACE_ID);
    await getAppProviderByClassName<AccessGroupSyncService>(
      'AccessGroupSyncService',
    ).syncAccessGroups(SEED_APPLE_WORKSPACE_ID);
    await waitForAllJobsToFinish();
  };

  const setVisibility = async (visibility: MessageChannelVisibility) => {
    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      { visibility },
    );
    await syncRules();
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id',
        filter: { subject: { eq: subject } },
      }),
    );

    messageId = response.body.data.messages.edges[0].node.id;

    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: true,
        expectToFail: false,
      });
    }

    await syncRules();
  }, 240000);

  afterAll(async () => {
    for (const featureFlag of FLAGS) {
      await updateFeatureFlag({
        featureFlag,
        value: false,
        expectToFail: false,
      });
    }

    await channel?.cleanup().catch(() => undefined);
  }, 120000);

  it('shows the full message to another member when the channel shares everything', async () => {
    await setVisibility(MessageChannelVisibility.SHARE_EVERYTHING);

    const [message] = await readMessageAs(makeGraphqlApiRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBeNull();
  }, 120000);

  it('hides the body but keeps the subject for another member under subject visibility', async () => {
    await setVisibility(MessageChannelVisibility.SUBJECT);

    const [message] = await readMessageAs(makeGraphqlApiRequestWithMemberRole);

    expect(message.subject).toBe(subject);
    expect(message.text).toBeNull();
  }, 120000);

  it('hides the subject and the body for another member under metadata visibility', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessageAs(makeGraphqlApiRequestWithMemberRole);

    expect(message.subject).toBeNull();
    expect(message.text).toBeNull();
  }, 120000);

  it('always shows the full message to the owner of the connected account', async () => {
    await setVisibility(MessageChannelVisibility.METADATA);

    const [message] = await readMessageAs(makeGraphqlApiRequest);

    expect(message.subject).toBe(subject);
    expect(message.text).not.toBeNull();
  }, 120000);
});
