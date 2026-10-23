import { gql } from 'graphql-tag';
import { createOneOperation } from 'test/integration/graphql/utils/create-one-operation.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  ConnectedAccountProvider,
  MessageChannelVisibility,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();

const WORKSPACE_SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const PHONES_FIELD_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.person.fields.phones.universalIdentifier;

const CREATE_CHANNEL_MUTATION = gql`
  mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
    createAppMessageChannel(input: $input) {
      id
      handle
      participantHandleFieldUniversalIdentifier
    }
  }
`;

const INGEST_MESSAGES_MUTATION = gql`
  mutation IngestAppMessages($input: IngestAppMessagesInput!) {
    ingestAppMessages(input: $input) {
      messages {
        messageId
        messageThreadId
      }
    }
  }
`;

type FrenchPhone = { nationalNumber: string } | null;

describe('app message channel participant matching (e2e)', () => {
  let applicationToken: string;
  let applicationDbId: string;
  let connectedAccountId: string;
  let messageChannelId: string;
  const personIds: string[] = [];

  const asApplication = (
    operation: Parameters<typeof makeMetadataApiRequest>[0],
  ) => makeMetadataApiRequest(operation, applicationToken);

  const toPhones = (phone: FrenchPhone) => ({
    primaryPhoneNumber: phone?.nationalNumber ?? '',
    primaryPhoneCallingCode: isDefined(phone) ? '+33' : '',
    primaryPhoneCountryCode: isDefined(phone) ? 'FR' : '',
    additionalPhones: [],
  });

  const createPerson = async ({
    firstName,
    phone,
  }: {
    firstName: string;
    phone: FrenchPhone;
  }) => {
    const id = v4();
    const response = await createOneOperation({
      objectMetadataSingularName: 'person',
      input: { id, name: { firstName }, phones: toPhones(phone) },
    });

    expect(response.errors).toBeUndefined();
    personIds.push(id);

    return id;
  };

  const updatePersonPhone = async ({
    personId,
    phone,
  }: {
    personId: string;
    phone: FrenchPhone;
  }) => {
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: personId,
        gqlFields: 'id',
        data: { phones: toPhones(phone) },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();
  };

  const ingestFrom = async ({
    externalId,
    senderHandle,
    personId,
    channelId = messageChannelId,
  }: {
    externalId: string;
    senderHandle: string;
    personId?: string;
    channelId?: string;
  }) => {
    const response = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId: channelId,
          messages: [
            {
              externalId,
              threadExternalId: `thread-${externalId}`,
              text: 'Hello',
              receivedAt: '2026-10-20T10:00:00.000Z',
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: senderHandle,
                  personId,
                },
                {
                  role: MessageParticipantRole.TO,
                  handle: '+33 6 00 00 00 00',
                },
              ],
            },
          ],
        },
      },
    });

    await waitForAllJobsToFinish();

    return response;
  };

  const findSender = async (
    messageId: string,
  ): Promise<{ handle: string; personId: string | null }> => {
    const [sender] = await globalThis.testDataSource.query(
      `SELECT handle, "personId" FROM "${WORKSPACE_SCHEMA}"."messageParticipant"
        WHERE "messageId" = $1 AND role = $2`,
      [messageId, MessageParticipantRole.FROM],
    );

    return sender;
  };

  const ingestFromOrThrow = async (args: Parameters<typeof ingestFrom>[0]) => {
    const response = await ingestFrom(args);

    expect(response.body.errors).toBeUndefined();

    const [ingestedMessage]: { messageId: string; messageThreadId: string }[] =
      response.body.data.ingestAppMessages.messages;

    return ingestedMessage;
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'App channel participant matching',
      description: 'Participant matching on a declared person field',
      sourcePath: 'app-channel-participant-matching',
    });

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'whatsapp',
              displayName: 'WhatsApp',
              type: 'oauth',
              oauth: {
                authorizationEndpoint: 'https://provider.example.com/authorize',
                tokenEndpoint: 'https://provider.example.com/token',
                scopes: [],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(
      APPLICATION_IDENTIFIER,
    );

    applicationDbId = provider.applicationId;
    applicationToken = (
      await generateAppleAdminApplicationTokenPair({
        applicationId: applicationDbId,
      })
    ).applicationAccessToken.token;

    connectedAccountId = v4();
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, scope, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId")
       VALUES ($1, $2, $3, 'WORKSPACE', $4, $5, $6, $7)`,
      [
        connectedAccountId,
        '+33600000000',
        ConnectedAccountProvider.APP,
        SEED_APPLE_WORKSPACE_ID,
        USER_WORKSPACE_DATA_SEED_IDS.JANE,
        applicationDbId,
        provider.id,
      ],
    );

    const channelResponse = await asApplication({
      query: CREATE_CHANNEL_MUTATION,
      variables: {
        input: {
          connectedAccountId,
          handle: '+33 6 00 00 00 00',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          participantHandleFieldUniversalIdentifier:
            PHONES_FIELD_UNIVERSAL_IDENTIFIER,
        },
      },
    });

    expect(channelResponse.body.errors).toBeUndefined();
    expect(channelResponse.body.data.createAppMessageChannel).toMatchObject({
      handle: '+33600000000',
      participantHandleFieldUniversalIdentifier:
        PHONES_FIELD_UNIVERSAL_IDENTIFIER,
    });

    messageChannelId = channelResponse.body.data.createAppMessageChannel.id;
  }, 180000);

  afterAll(async () => {
    const messages: { id: string; messageThreadId: string | null }[] =
      await globalThis.testDataSource.query(
        `SELECT id, "messageThreadId" FROM "${WORKSPACE_SCHEMA}"."message"
           WHERE "headerMessageId" LIKE $1`,
        [`app:${applicationDbId}:%`],
      );
    const messageIds = messages.map((message) => message.id);
    const messageThreadIds = [
      ...new Set(
        messages.map((message) => message.messageThreadId).filter(isDefined),
      ),
    ];

    for (const table of [
      'messageChannelMessageAssociation',
      'messageParticipant',
    ]) {
      await globalThis.testDataSource.query(
        `DELETE FROM "${WORKSPACE_SCHEMA}"."${table}" WHERE "messageId" = ANY($1)`,
        [messageIds],
      );
    }
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."message" WHERE id = ANY($1)`,
      [messageIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThreadTarget" WHERE "messageThreadId" = ANY($1)`,
      [messageThreadIds],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA}"."messageThread" WHERE id = ANY($1)`,
      [messageThreadIds],
    );

    for (const personId of personIds) {
      await makeGraphqlApiRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'person',
          recordId: personId,
          gqlFields: 'id',
        }),
      );
    }

    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount" WHERE id = $1`,
      [connectedAccountId],
    );
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
  }, 120000);

  it('stores the handle in canonical form and links it to the person with that phone', async () => {
    const adaId = await createPerson({
      firstName: 'Ada',
      phone: { nationalNumber: '612345678' },
    });

    const { messageId, messageThreadId } = await ingestFromOrThrow({
      externalId: 'from-ada',
      senderHandle: '+33 6 12 34 56 78',
    });

    expect(await findSender(messageId)).toEqual({
      handle: '+33612345678',
      personId: adaId,
    });

    const targets = await globalThis.testDataSource.query(
      `SELECT "targetPersonId" FROM "${WORKSPACE_SCHEMA}"."messageThreadTarget"
        WHERE "messageThreadId" = $1`,
      [messageThreadId],
    );

    expect(targets).toEqual(
      expect.arrayContaining([{ targetPersonId: adaId }]),
    );
  });

  it('links past conversations when a person gains the value and releases them when they lose it', async () => {
    const graceId = await createPerson({ firstName: 'Grace', phone: null });

    const { messageId } = await ingestFromOrThrow({
      externalId: 'from-grace',
      senderHandle: '+33699999999',
    });

    expect((await findSender(messageId)).personId).toBeNull();

    await updatePersonPhone({
      personId: graceId,
      phone: { nationalNumber: '699999999' },
    });
    expect((await findSender(messageId)).personId).toBe(graceId);

    await updatePersonPhone({ personId: graceId, phone: null });
    expect((await findSender(messageId)).personId).toBeNull();
  });

  it('keeps a personId the app passes, even when another person gains or loses that value', async () => {
    const katherineId = await createPerson({
      firstName: 'Katherine',
      phone: null,
    });
    const dorothyId = await createPerson({
      firstName: 'Dorothy',
      phone: { nationalNumber: '688888888' },
    });

    const { messageId } = await ingestFromOrThrow({
      externalId: 'from-dorothy-number',
      senderHandle: '+33688888888',
      personId: katherineId,
    });

    expect((await findSender(messageId)).personId).toBe(katherineId);

    await updatePersonPhone({ personId: dorothyId, phone: null });
    expect((await findSender(messageId)).personId).toBe(katherineId);
  });

  it('relinks to the next person with that value when the linked person is destroyed', async () => {
    const hedyId = await createPerson({
      firstName: 'Hedy',
      phone: { nationalNumber: '677777777' },
    });
    const radiaId = await createPerson({
      firstName: 'Radia',
      phone: { nationalNumber: '677777777' },
    });

    const { messageId } = await ingestFromOrThrow({
      externalId: 'from-shared-number',
      senderHandle: '+33677777777',
    });

    expect((await findSender(messageId)).personId).toBe(hedyId);

    const response = await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: hedyId,
        gqlFields: 'id',
      }),
    );

    expect(response.body.errors).toBeUndefined();
    personIds.splice(personIds.indexOf(hedyId), 1);
    await waitForAllJobsToFinish();

    expect((await findSender(messageId)).personId).toBe(radiaId);
  });

  it('keeps a personId the app passes when a person gains that handle as an email', async () => {
    const channelResponse = await asApplication({
      query: CREATE_CHANNEL_MUTATION,
      variables: {
        input: {
          connectedAccountId,
          handle: 'inbox@example.com',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
        },
      },
    });

    expect(channelResponse.body.errors).toBeUndefined();

    const katherineId = await createPerson({
      firstName: 'Katherine',
      phone: null,
    });

    const { messageId } = await ingestFromOrThrow({
      externalId: 'from-mary-email',
      senderHandle: 'mary@example.com',
      personId: katherineId,
      channelId: channelResponse.body.data.createAppMessageChannel.id,
    });

    expect((await findSender(messageId)).personId).toBe(katherineId);

    const maryId = await createPerson({ firstName: 'Mary', phone: null });
    const response = await makeGraphqlApiRequest(
      updateOneOperationFactory({
        objectMetadataSingularName: 'person',
        recordId: maryId,
        gqlFields: 'id',
        data: {
          emails: { primaryEmail: 'mary@example.com', additionalEmails: [] },
        },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();

    expect((await findSender(messageId)).personId).toBe(katherineId);
  });

  it('links a sender stored before a matching person existed when the message is ingested again', async () => {
    const { messageId } = await ingestFromOrThrow({
      externalId: 'from-before-match',
      senderHandle: '+33655555555',
    });

    expect((await findSender(messageId)).personId).toBeNull();

    const maryId = await createPerson({ firstName: 'Mary', phone: null });

    // written straight to the table so no person event rematches it
    await globalThis.testDataSource.query(
      `UPDATE "${WORKSPACE_SCHEMA}"."person"
          SET "phonesPrimaryPhoneNumber" = '655555555',
              "phonesPrimaryPhoneCallingCode" = '+33'
        WHERE id = $1`,
      [maryId],
    );

    await ingestFromOrThrow({
      externalId: 'from-before-match',
      senderHandle: '+33655555555',
    });

    expect((await findSender(messageId)).personId).toBe(maryId);
  });

  it('keeps links that differ only by their query apart', async () => {
    const channelResponse = await asApplication({
      query: CREATE_CHANNEL_MUTATION,
      variables: {
        input: {
          connectedAccountId,
          handle: 'https://www.facebook.com/profile.php?id=999',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          participantHandleFieldUniversalIdentifier:
            STANDARD_OBJECTS.person.fields.linkedinLink.universalIdentifier,
        },
      },
    });

    expect(channelResponse.body.errors).toBeUndefined();

    const createPersonWithLink = async (primaryLinkUrl: string) => {
      const id = v4();
      const response = await createOneOperation({
        objectMetadataSingularName: 'person',
        input: {
          id,
          name: { firstName: 'Linked' },
          linkedinLink: { primaryLinkUrl },
        },
      });

      expect(response.errors).toBeUndefined();
      personIds.push(id);

      return id;
    };

    await createPersonWithLink('https://www.facebook.com/profile.php?id=111');
    const secondId = await createPersonWithLink(
      'https://www.facebook.com/profile.php?id=222',
    );

    const { messageId } = await ingestFromOrThrow({
      externalId: 'from-profile-222',
      senderHandle: 'https://facebook.com/profile.php?id=222',
      channelId: channelResponse.body.data.createAppMessageChannel.id,
    });

    expect(await findSender(messageId)).toEqual({
      handle: 'facebook.com/profile.php?id=222',
      personId: secondId,
    });
  });

  it('stores one participant when a message lists two spellings of the same handle', async () => {
    const response = await asApplication({
      query: INGEST_MESSAGES_MUTATION,
      variables: {
        input: {
          messageChannelId,
          messages: [
            {
              externalId: 'two-spellings',
              threadExternalId: 'thread-two-spellings',
              text: 'Hello',
              receivedAt: '2026-10-20T10:00:00.000Z',
              participants: [
                {
                  role: MessageParticipantRole.FROM,
                  handle: '+33 6 22 22 22 22',
                },
                {
                  role: MessageParticipantRole.TO,
                  handle: '+33 6 44 44 44 44',
                },
                { role: MessageParticipantRole.TO, handle: '+33644444444' },
              ],
            },
          ],
        },
      },
    });

    expect(response.body.errors).toBeUndefined();
    await waitForAllJobsToFinish();

    const [{ messageId }] = response.body.data.ingestAppMessages.messages;
    const recipients = await globalThis.testDataSource.query(
      `SELECT handle FROM "${WORKSPACE_SCHEMA}"."messageParticipant"
        WHERE "messageId" = $1 AND role = $2`,
      [messageId, MessageParticipantRole.TO],
    );

    expect(recipients).toEqual([{ handle: '+33644444444' }]);
  });

  it('rejects a handle that has no phone digits', async () => {
    const response = await ingestFrom({
      externalId: 'from-nobody',
      senderHandle: 'not a number',
    });

    expect(response.body.errors).toBeDefined();
  });

  it('refuses a field that cannot hold handles', async () => {
    const response = await asApplication({
      query: CREATE_CHANNEL_MUTATION,
      variables: {
        input: {
          connectedAccountId,
          handle: '+33 6 11 11 11 11',
          visibility: MessageChannelVisibility.SHARE_EVERYTHING,
          participantHandleFieldUniversalIdentifier:
            STANDARD_OBJECTS.person.fields.company.universalIdentifier,
        },
      },
    });

    expect(response.body.errors).toBeDefined();
  });
});
