import { randomUUID } from 'node:crypto';

import { type gmail_v1 } from 'googleapis';

import {
  ConnectedAccountProvider,
  MessageChannelContactAutoCreationPolicy,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { mergeManyOperationFactory } from 'test/integration/graphql/utils/merge-many-operation-factory.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { resetMessageChannelSyncState } from 'test/integration/utils/reset-channel-sync-state.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';
import { waitForTimelineActivities } from 'test/integration/utils/wait-for-timeline-activities.util';

const HANDLE = 'gmail-company-domain-matching@apple.dev';

describe('Gmail contact auto-creation company domain matching (integration)', () => {
  const inbox: gmail_v1.Schema$Message[] = [];

  const gmail = setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  const createdCompanyIds: string[] = [];

  const mergeTwoCompanies = async ({
    survivingDomainName,
    mergedAwayDomainName,
  }: {
    survivingDomainName: string;
    mergedAwayDomainName: string;
  }) => {
    const createResponse = await makeGraphqlAPIRequest(
      createManyOperationFactory({
        objectMetadataSingularName: 'company',
        objectMetadataPluralName: 'companies',
        gqlFields: 'id',
        data: [
          {
            name: `Surviving ${randomUUID()}`,
            domainName: { primaryLinkUrl: `https://${survivingDomainName}` },
          },
          {
            name: `Merged away ${randomUUID()}`,
            domainName: { primaryLinkUrl: `https://${mergedAwayDomainName}` },
          },
        ],
      }),
    );

    const [survivingCompany, mergedAwayCompany] =
      createResponse.body.data.createCompanies;

    createdCompanyIds.push(survivingCompany.id, mergedAwayCompany.id);

    await waitForTimelineActivities('targetCompanyId', [
      survivingCompany.id,
      mergedAwayCompany.id,
    ]);

    const mergeResponse = await makeGraphqlAPIRequest(
      mergeManyOperationFactory({
        objectMetadataPluralName: 'companies',
        gqlFields: 'id domainName { primaryLinkUrl secondaryLinks }',
        ids: [survivingCompany.id, mergedAwayCompany.id],
        conflictPriorityIndex: 0,
      }),
    );

    expect(mergeResponse.body.errors).toBeUndefined();

    return mergeResponse.body.data.mergeCompanies;
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

  it('attaches a contact to the surviving company when its domain was merged into secondary links', async () => {
    const mergedAwayDomainName = `merged-away-${randomUUID()}.com`;
    const mergedCompany = await mergeTwoCompanies({
      survivingDomainName: `surviving-${randomUUID()}.com`,
      mergedAwayDomainName,
    });

    expect(mergedCompany.domainName.secondaryLinks).toEqual([
      expect.objectContaining({ url: `https://${mergedAwayDomainName}` }),
    ]);

    expect(await syncMessageFrom(`sender@${mergedAwayDomainName}`)).toBe(
      mergedCompany.id,
    );
  }, 120000);

  it('attaches a contact to the surviving company on its primary domain', async () => {
    const survivingDomainName = `surviving-${randomUUID()}.com`;
    const mergedCompany = await mergeTwoCompanies({
      survivingDomainName,
      mergedAwayDomainName: `merged-away-${randomUUID()}.com`,
    });

    expect(await syncMessageFrom(`sender@${survivingDomainName}`)).toBe(
      mergedCompany.id,
    );
  }, 120000);
});
