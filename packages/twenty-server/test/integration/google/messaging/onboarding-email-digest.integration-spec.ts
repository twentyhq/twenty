import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type OnboardingEmailDigestService } from 'src/modules/onboarding-email-digest/services/onboarding-email-digest.service';

const HANDLE = 'onboarding-email-digest@apple.dev';

const digestGmailMessage = ({
  id,
  from,
  to,
  subject,
  internalDate,
  labelIds,
}: {
  id: string;
  from: string;
  to: string;
  subject: string;
  internalDate: string;
  labelIds: string[];
}) =>
  gmailMessage({
    id,
    threadId: id,
    internalDate,
    labelIds,
    payload: {
      mimeType: 'text/plain',
      headers: [
        { name: 'From', value: from },
        { name: 'To', value: to },
        { name: 'Subject', value: subject },
        { name: 'Message-ID', value: `<${id}@example.com>` },
        { name: 'Date', value: 'Mon, 4 Aug 2025 09:00:00 +0000' },
      ],
      body: { data: Buffer.from('body').toString('base64'), size: 4 },
    },
  });

describe('Onboarding email digest (integration)', () => {
  const inbox = [
    digestGmailMessage({
      id: 'digest-q3-renewal',
      from: 'Jane Doe <jane@corp.com>',
      to: HANDLE,
      subject: 'Q3 renewal',
      internalDate: '1754300000000',
      labelIds: ['INBOX'],
    }),
    digestGmailMessage({
      id: 'digest-intro-call',
      from: 'Jane Doe <jane@corp.com>',
      to: HANDLE,
      subject: 'Intro call notes',
      internalDate: '1754200000000',
      labelIds: ['INBOX'],
    }),
    digestGmailMessage({
      id: 'digest-draft',
      from: HANDLE,
      to: 'jane@corp.com',
      subject: 'Draft reply never sent',
      internalDate: '1754400000000',
      labelIds: ['INBOX', 'DRAFT'],
    }),
  ];

  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const getConnectedAccount = () =>
    getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).findOneByOrFail({ id: channel.connectedAccountId });

  const getDigestService = () =>
    getAppProviderByClassName<OnboardingEmailDigestService>(
      'OnboardingEmailDigestService',
    );

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('builds the digest from imported non-draft messages and excludes own handles', async () => {
    await runMessageChannelSync(channel.channelId);

    const connectedAccount = await getConnectedAccount();

    const digest = await getDigestService().buildDigestForUser({
      workspaceId: connectedAccount.workspaceId,
      userWorkspaceId: connectedAccount.userWorkspaceId,
    });

    // The seeded workspace ships connected accounts and channels for the same
    // user, so the account-level fields depend on seed data this spec doesn't own.
    expect(digest).toEqual({
      syncState: expect.stringMatching(/^(IMPORTING|SYNCED)$/),
      connectedAccountHandle: expect.stringContaining('@apple.dev'),
      importedMessageCount: 2,
      topContacts: [
        { handle: 'jane@corp.com', displayName: 'Jane Doe', messageCount: 2 },
      ],
      topCompanyDomains: [{ domain: 'corp.com', messageCount: 2 }],
      recentSubjects: [
        { subject: 'Q3 renewal', receivedAt: '2025-08-04' },
        { subject: 'Intro call notes', receivedAt: '2025-08-03' },
      ],
    });
  }, 60000);

  it('reports not connected for a user without a connected account', async () => {
    const connectedAccount = await getConnectedAccount();

    await expect(
      getDigestService().buildDigestForUser({
        workspaceId: connectedAccount.workspaceId,
        userWorkspaceId: randomUUID(),
      }),
    ).resolves.toEqual({ syncState: 'NOT_CONNECTED' });
  });
});
