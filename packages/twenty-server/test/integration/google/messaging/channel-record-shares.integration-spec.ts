import { randomUUID } from 'node:crypto';

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  ConnectedAccountProvider,
  MessageChannelVisibility,
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordShares } from 'test/integration/utils/find-record-shares.util';
import { insertRecordShare } from 'test/integration/utils/insert-record-share.util';
import { updateMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const JANE_HANDLE = 'gmail-record-shares-jane@apple.dev';
const JONY_HANDLE = 'gmail-record-shares-jony@apple.dev';
const SENDER_HANDLE = `sender-${randomUUID()}@acme.com`;

const ownerShare = (workspaceMemberId: string, channelId: string) => ({
  principalId: workspaceMemberId,
  principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
  accessLevel: RecordShareAccessLevel.FULL,
  rowCause: RecordShareRowCause.OWNER,
  sourceId: channelId,
});

const everyoneShare = (channelId: string) => ({
  principalId: EVERYONE_PRINCIPAL_ID,
  principalType: RecordSharePrincipalType.EVERYONE,
  accessLevel: RecordShareAccessLevel.READ,
  rowCause: RecordShareRowCause.RULE,
  sourceId: channelId,
});

describe('Message thread grants derived from channels (integration)', () => {
  const inbox = [gmailMessage({ from: SENDER_HANDLE })];
  const subject = getGmailMessageSubject(inbox[0]);

  const gmail = setupGoogleMock({ handle: JANE_HANDLE, inbox });

  let janeChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let jonyChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let messageThreadId: string;
  let blocklistId: string | undefined;

  beforeAll(async () => {
    janeChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: JANE_HANDLE,
    });

    await runMessageChannelSync(janeChannel.channelId);

    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'messageThreadId',
        filter: { subject: { eq: subject } },
      }),
    );

    messageThreadId = response.body.data.messages.edges[0].node.messageThreadId;
  }, 120000);

  afterAll(async () => {
    if (isDefined(blocklistId)) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'blocklist',
          gqlFields: 'id',
          recordId: blocklistId,
        }),
      ).catch(() => undefined);
    }

    await janeChannel?.cleanup().catch(() => undefined);
    await jonyChannel?.cleanup().catch(() => undefined);
  });

  it('makes the syncing member an owner and shares with everyone when the channel shares everything', async () => {
    expect(await findRecordShares(messageThreadId)).toEqual([
      ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, janeChannel.channelId),
      everyoneShare(janeChannel.channelId),
    ]);
  }, 60000);

  it('withdraws the everyone share when the channel stops sharing and restores it after', async () => {
    await updateMessageChannel(janeChannel.channelId, {
      visibility: MessageChannelVisibility.METADATA,
    });

    expect(await findRecordShares(messageThreadId)).toEqual([
      ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, janeChannel.channelId),
    ]);

    await updateMessageChannel(janeChannel.channelId, {
      visibility: MessageChannelVisibility.SUBJECT,
    });

    expect(await findRecordShares(messageThreadId)).toEqual([
      ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, janeChannel.channelId),
    ]);

    await updateMessageChannel(janeChannel.channelId, {
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    });

    expect(await findRecordShares(messageThreadId)).toEqual([
      ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, janeChannel.channelId),
      everyoneShare(janeChannel.channelId),
    ]);
  }, 60000);

  it('rewrites grants the channel would no longer write as they are', async () => {
    await updateMessageChannel(janeChannel.channelId, {
      visibility: MessageChannelVisibility.METADATA,
    });

    await insertRecordShare({
      objectNameSingular: 'messageThread',
      recordId: messageThreadId,
      share: ownerShare(
        WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        janeChannel.channelId,
      ),
    });
    await insertRecordShare({
      objectNameSingular: 'messageThread',
      recordId: messageThreadId,
      share: {
        ...everyoneShare(janeChannel.channelId),
        accessLevel: RecordShareAccessLevel.READ_WRITE,
      },
    });

    await updateMessageChannel(janeChannel.channelId, {
      visibility: MessageChannelVisibility.SHARE_EVERYTHING,
    });

    expect(await findRecordShares(messageThreadId)).toEqual([
      ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, janeChannel.channelId),
      everyoneShare(janeChannel.channelId),
    ]);
  }, 60000);

  it('makes every member who synced the thread an owner', async () => {
    gmail.actAsAccount(JONY_HANDLE);

    jonyChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: JONY_HANDLE,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    await runMessageChannelSync(jonyChannel.channelId);

    const shares = await findRecordShares(messageThreadId);

    expect(shares).toHaveLength(4);
    expect(shares).toEqual(
      expect.arrayContaining([
        ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JANE, janeChannel.channelId),
        everyoneShare(janeChannel.channelId),
        ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, jonyChannel.channelId),
        everyoneShare(jonyChannel.channelId),
      ]),
    );
  }, 120000);

  it('drops the grants of a member whose channel no longer holds the thread and keeps the others', async () => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'blocklist',
        gqlFields: 'id',
        data: {
          handle: SENDER_HANDLE,
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();

    blocklistId = response.body.data.createBlocklist.id;

    await waitForAllJobsToFinish();

    expect(await findRecordShares(messageThreadId)).toEqual([
      ownerShare(WORKSPACE_MEMBER_DATA_SEED_IDS.JONY, jonyChannel.channelId),
      everyoneShare(jonyChannel.channelId),
    ]);
  }, 120000);

  it('drops the grants of a removed channel', async () => {
    await jonyChannel.cleanup();

    expect(await findRecordShares(messageThreadId)).toEqual([]);
  }, 60000);
});
