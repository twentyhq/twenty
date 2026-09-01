import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { getGmailMessageSubject } from 'test/integration/google/mocks/gmail-message-subject.util';
import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE_1 = 'gmail-blocklist-multi-1@apple.dev';
const HANDLE_2 = 'gmail-blocklist-multi-2@apple.dev';

const BLOCKED_A = `blocked-a-${randomUUID()}@acme.com`;
const BLOCKED_B = `blocked-b-${randomUUID()}@acme.com`;
const KEPT_1 = `kept-1-${randomUUID()}@acme.com`;
const KEPT_2 = `kept-2-${randomUUID()}@acme.com`;

describe('Blocklist cleanup with multiple handles across multiple channels (integration)', () => {
  const messageFromAToChannel1 = gmailMessage({
    from: BLOCKED_A,
    to: HANDLE_1,
  });
  const messageFromBToChannel1 = gmailMessage({
    from: BLOCKED_B,
    to: HANDLE_1,
  });
  const keptMessageChannel1 = gmailMessage({ from: KEPT_1, to: HANDLE_1 });

  const messageFromAToChannel2 = gmailMessage({
    from: BLOCKED_A,
    to: HANDLE_2,
  });
  const messageFromBToChannel2 = gmailMessage({
    from: BLOCKED_B,
    to: HANDLE_2,
  });
  const keptMessageChannel2 = gmailMessage({ from: KEPT_2, to: HANDLE_2 });

  const subjectAChannel1 = getGmailMessageSubject(messageFromAToChannel1);
  const subjectBChannel1 = getGmailMessageSubject(messageFromBToChannel1);
  const keptSubjectChannel1 = getGmailMessageSubject(keptMessageChannel1);

  const subjectAChannel2 = getGmailMessageSubject(messageFromAToChannel2);
  const subjectBChannel2 = getGmailMessageSubject(messageFromBToChannel2);
  const keptSubjectChannel2 = getGmailMessageSubject(keptMessageChannel2);

  const allSubjects = [
    subjectAChannel1,
    subjectBChannel1,
    keptSubjectChannel1,
    subjectAChannel2,
    subjectBChannel2,
    keptSubjectChannel2,
  ];

  const inbox = [
    messageFromAToChannel1,
    messageFromBToChannel1,
    keptMessageChannel1,
  ];

  const gmail = setupGoogleMock({ handle: HANDLE_1, inbox });

  let channel1: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let channel2: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel1 = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE_1,
    });

    await runMessageChannelSync(channel1.channelId);

    gmail.actAsAccount(HANDLE_2);

    const channel2Messages = [
      messageFromAToChannel2,
      messageFromBToChannel2,
      keptMessageChannel2,
    ];

    // The detail/batch fetch handlers resolve against the shared inbox
    // reference, so channel 2's messages must be added to it as well as
    // served through the list endpoint.
    inbox.push(...channel2Messages);
    gmail.serveMessageList(channel2Messages);

    channel2 = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE_2,
    });

    await runMessageChannelSync(channel2.channelId);
  }, 180000);

  afterAll(async () => {
    await channel1?.cleanup().catch(() => undefined);
    await channel2?.cleanup().catch(() => undefined);
  });

  it('imports every blocked and kept message on both channels before anything is blocked', async () => {
    expect(await findImportedMessageSubjects(allSubjects)).toEqual(
      [...allSubjects].sort(),
    );
  }, 60000);

  it('blocking multiple handles at once deletes their messages from every channel and keeps everything else', async () => {
    const response = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'blocklist',
        objectMetadataPluralName: 'blocklists',
        gqlFields: 'id handle',
        data: [
          {
            handle: BLOCKED_A,
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          },
          {
            handle: BLOCKED_B,
            workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
          },
        ],
      }),
    );

    expect(response.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    expect(await findImportedMessageSubjects(allSubjects)).toEqual(
      [keptSubjectChannel1, keptSubjectChannel2].sort(),
    );
  }, 120000);
});
