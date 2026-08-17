import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'gmail-company-domain-matching@apple.dev';

describe('Gmail contact auto-creation company domain matching (integration)', () => {
  const inbox: gmail_v1.Schema$Message[] = [];

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  const createdCompanyIds: string[] = [];

  const createCompanyWithSecondaryDomain = async ({
    primaryDomainName,
    secondaryDomainName,
  }: {
    primaryDomainName: string;
    secondaryDomainName: string;
  }) => {
    const { data } = await createOneOperation({
      objectMetadataSingularName: 'company',
      gqlFields: 'id',
      input: {
        name: `Company ${randomUUID()}`,
        domainName: {
          primaryLinkUrl: `https://${primaryDomainName}`,
          primaryLinkLabel: '',
          secondaryLinks: [
            { url: `https://${secondaryDomainName}`, label: '' },
          ],
        },
      },
    });

    createdCompanyIds.push(data.createOneResponse.id);

    return data.createOneResponse.id;
  };

  const syncMessageFrom = async (sender: string) => {
    const messages = [gmailMessage({ from: sender, to: HANDLE })];

    inbox.push(...messages);
    gmail.serveMessageList(messages);

    await resetMessageChannelSyncState(channel.channelId, '');

    await runMessageChannelSync(channel.channelId);

    const [person] = await findRecordNodesByFilter<{
      company: { id: string } | null;
    }>('person', 'people', 'company { id }', {
      emails: { primaryEmail: { eq: sender } },
    });

    return person?.company?.id;
  };

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: channel.channelId },
      {
        isContactAutoCreationEnabled: true,
        contactAutoCreationPolicy:
          MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
        excludeGroupEmails: false,
        excludeNonProfessionalEmails: false,
      },
    );
  }, 60000);

  afterAll(async () => {
    await deleteRecordsByIds('company', createdCompanyIds);
    await channel?.cleanup().catch(() => undefined);
  });

  it('attaches a contact to the company owning the domain as a secondary link', async () => {
    const secondaryDomainName = `secondary-${randomUUID()}.com`;
    const companyId = await createCompanyWithSecondaryDomain({
      primaryDomainName: `primary-${randomUUID()}.com`,
      secondaryDomainName,
    });

    expect(await syncMessageFrom(`sender@${secondaryDomainName}`)).toBe(
      companyId,
    );
  }, 60000);

  it('attaches a contact to the company owning the domain as its primary link', async () => {
    const primaryDomainName = `primary-${randomUUID()}.com`;
    const companyId = await createCompanyWithSecondaryDomain({
      primaryDomainName,
      secondaryDomainName: `secondary-${randomUUID()}.com`,
    });

    expect(await syncMessageFrom(`sender@${primaryDomainName}`)).toBe(
      companyId,
    );
  }, 60000);
});
