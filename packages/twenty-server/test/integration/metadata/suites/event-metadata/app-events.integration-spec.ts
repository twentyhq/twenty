import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { generateApplicationAccessToken } from 'test/integration/utils/generate-application-access-token.util';
import { type EventManifest } from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const MESSAGE_ADDED_EVENT_ID = uuidv4();
// Emitting checks a record reference's format only, so no company has to exist
const COMPANY_ID = uuidv4();

const EMIT_APP_EVENT_MUTATION = gql`
  mutation EmitAppEvent($input: EmitAppEventInput!) {
    emitAppEvent(input: $input) {
      id
      occurredAt
    }
  }
`;

const MESSAGE_ADDED_EVENT: EventManifest = {
  universalIdentifier: MESSAGE_ADDED_EVENT_ID,
  name: 'messageAdded',
  label: 'Message added',
  schema: {
    type: 'object',
    properties: {
      companyId: {
        type: 'record',
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
      },
      text: { type: 'string' },
    },
    required: ['companyId'],
  },
};

const syncEvents = ({
  events,
  expectToFail = false,
}: {
  events: EventManifest[];
  expectToFail?: boolean;
}) =>
  syncApplication({
    manifest: buildBaseManifest({
      appId: TEST_APP_ID,
      roleId: TEST_ROLE_ID,
      overrides: {
        roles: [
          {
            universalIdentifier: TEST_ROLE_ID,
            label: 'Test Role',
            canReadAllObjectRecords: true,
          },
        ],
        events,
      },
    }),
    expectToFail,
  });

describe('app events (e2e)', () => {
  let applicationToken: string;
  let frontComponentToken: string;

  const emit = (input: {
    event?: string;
    eventUniversalIdentifier?: string;
    id?: string;
    properties?: Record<string, unknown>;
  }) =>
    makeMetadataApiRequest(
      { query: EMIT_APP_EVENT_MUTATION, variables: { input } },
      applicationToken,
    );

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing events',
      sourcePath: 'test-app-events',
    });

    await syncEvents({ events: [MESSAGE_ADDED_EVENT] });

    const [application] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application" WHERE "universalIdentifier" = $1`,
      [TEST_APP_ID],
    );

    applicationToken = await generateApplicationAccessToken({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    frontComponentToken = (
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      })
    ).applicationAccessToken.token;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('stores the declared event', async () => {
    const storedEvents = await globalThis.testDataSource.query(
      `SELECT name, schema FROM core."eventMetadata" WHERE "universalIdentifier" = $1`,
      [MESSAGE_ADDED_EVENT_ID],
    );

    expect(storedEvents).toEqual([
      {
        name: 'messageAdded',
        schema: MESSAGE_ADDED_EVENT.schema,
      },
    ]);
  });

  it('refuses a record reference to an object that does not exist', async () => {
    await syncEvents({
      events: [
        {
          ...MESSAGE_ADDED_EVENT,
          schema: {
            type: 'object',
            properties: {
              companyId: {
                type: 'record',
                objectUniversalIdentifier: uuidv4(),
              },
            },
          },
        },
      ],
      expectToFail: true,
    });
  });

  it('refuses a nested property', async () => {
    await syncEvents({
      events: [
        {
          ...MESSAGE_ADDED_EVENT,
          schema: {
            type: 'object',
            properties: {
              author: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          },
        },
      ],
      expectToFail: true,
    });
  });

  it('refuses an enum that is not a list', async () => {
    await syncEvents({
      events: [
        {
          ...MESSAGE_ADDED_EVENT,
          schema: JSON.parse(
            '{"type":"object","properties":{"channel":{"type":"string","enum":"email"}}}',
          ),
        },
      ],
      expectToFail: true,
    });
  });

  it('acknowledges an occurrence that matches the definition', async () => {
    const response = await emit({
      event: 'messageAdded',
      properties: { companyId: COMPANY_ID, text: 'Hello' },
    });

    expect(response.body.data.emitAppEvent).toEqual({
      id: expect.any(String),
      occurredAt: expect.any(String),
    });
  });

  it('finds the event by universal identifier and keeps the id the caller chose', async () => {
    const response = await emit({
      eventUniversalIdentifier: MESSAGE_ADDED_EVENT_ID,
      id: 'message-added-1',
      properties: { companyId: COMPANY_ID },
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.emitAppEvent.id).toBe('message-added-1');
  });

  it('refuses an id outside the allowed characters', async () => {
    const response = await emit({
      event: 'messageAdded',
      id: 'not allowed!',
      properties: { companyId: COMPANY_ID },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('refuses both an event name and a universal identifier', async () => {
    const response = await emit({
      event: 'messageAdded',
      eventUniversalIdentifier: MESSAGE_ADDED_EVENT_ID,
      properties: { companyId: COMPANY_ID },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('refuses a member acting through a front component token', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: EMIT_APP_EVENT_MUTATION,
        variables: {
          input: {
            event: 'messageAdded',
            properties: { companyId: COMPANY_ID },
          },
        },
      },
      frontComponentToken,
    );

    expect(response.body.data?.emitAppEvent ?? null).toBeNull();
    expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
  });

  it('refuses properties that do not match the definition', async () => {
    const response = await emit({
      event: 'messageAdded',
      properties: { companyId: 'not-a-uuid' },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('refuses an event the application did not declare', async () => {
    const response = await emit({ event: 'somethingElse' });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
  });
});
