import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { type EventManifest } from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const MESSAGE_ADDED_EVENT_ID = uuidv4();

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
  properties: [
    {
      name: 'companyId',
      type: 'RECORD_REFERENCE',
      objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company,
      isRequired: true,
    },
    { name: 'text', type: 'TEXT' },
  ],
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
  let companyId: string;

  const emit = (input: Record<string, unknown>) =>
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

    applicationToken = (
      await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      })
    ).applicationAccessToken.token;

    const [company] = await globalThis.testDataSource.query(
      `SELECT id FROM ${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}.company WHERE "deletedAt" IS NULL LIMIT 1`,
    );

    companyId = company.id;
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: TEST_APP_ID,
    });
  });

  it('stores the declared event', async () => {
    const storedEvents = await globalThis.testDataSource.query(
      `SELECT name, properties, capabilities FROM core."eventMetadata" WHERE "universalIdentifier" = $1`,
      [MESSAGE_ADDED_EVENT_ID],
    );

    expect(storedEvents).toEqual([
      {
        name: 'messageAdded',
        properties: MESSAGE_ADDED_EVENT.properties,
        capabilities: {},
      },
    ]);
  });

  it('refuses a record reference to an object that does not exist', async () => {
    await syncEvents({
      events: [
        {
          ...MESSAGE_ADDED_EVENT,
          properties: [
            {
              name: 'companyId',
              type: 'RECORD_REFERENCE',
              objectUniversalIdentifier: uuidv4(),
            },
          ],
        },
      ],
      expectToFail: true,
    });
  });

  it('acknowledges an occurrence that matches the definition', async () => {
    const response = await emit({
      event: 'messageAdded',
      properties: { companyId, text: 'Hello' },
    });

    expect(response.body.data.emitAppEvent).toEqual({
      id: expect.any(String),
      occurredAt: expect.any(String),
    });
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
