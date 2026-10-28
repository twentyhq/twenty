import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import {
  type EventManifest,
  type EventOccurrence,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { v4 as uuidv4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const TEST_APP_ID = uuidv4();
const TEST_ROLE_ID = uuidv4();
const MESSAGE_ADDED_EVENT_ID = uuidv4();
const SERVER_URL = `http://localhost:${APP_PORT}`;

const EMIT_APP_EVENT_MUTATION = gql`
  mutation EmitAppEvent($input: EmitAppEventInput!) {
    emitAppEvent(input: $input) {
      id
      occurredAt
    }
  }
`;

const CREATE_APP_VISITOR_EVENT_TOKEN_MUTATION = gql`
  mutation CreateAppVisitorEventToken(
    $input: CreateAppVisitorEventTokenInput!
  ) {
    createAppVisitorEventToken(input: $input) {
      token
      expiresAt
    }
  }
`;

const ON_APP_EVENT_SUBSCRIPTION = `
  subscription OnAppEvent($input: OnAppEventInput!) {
    onAppEvent(input: $input) {
      occurrence {
        id
        type
        occurredAt
        properties
      }
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
  capabilities: {
    realtime: {
      scopes: [{ kind: 'record', property: 'companyId' }, { kind: 'visitor' }],
    },
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

type ServerSentEvent = { event: string; data: string };

type AppEventStreamMessage = {
  data?: { onAppEvent: { occurrence: EventOccurrence | null } };
  errors?: { extensions?: { code?: string } }[];
};

const openServerSentEventStream = async (url: string, init?: RequestInit) => {
  const abortController = new AbortController();
  const response = await fetch(url, {
    ...init,
    signal: abortController.signal,
  });
  const receivedEvents: ServerSentEvent[] = [];
  let buffer = '';

  const chunks = (response.body as unknown as AsyncIterable<Uint8Array>)[
    Symbol.asyncIterator
  ]();
  const decoder = new TextDecoder();

  const readUntil = async (
    isComplete: (events: ServerSentEvent[]) => boolean,
  ) => {
    while (!isComplete(receivedEvents)) {
      const { done, value } = await chunks.next();

      if (done === true) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split('\n\n');

      buffer = blocks.pop() ?? '';

      for (const block of blocks) {
        const lines = block.split('\n');
        const eventLine = lines.find((line) => line.startsWith('event: '));
        const dataLines = lines.filter((line) => line.startsWith('data: '));

        if (eventLine && dataLines.length > 0) {
          receivedEvents.push({
            event: eventLine.slice(7),
            data: dataLines.map((line) => line.slice(6)).join('\n'),
          });
        }
      }
    }
  };

  return {
    response,
    receivedEvents,
    readUntil,
    close: () => abortController.abort(),
  };
};

const openVisitorStream = async (token: string) => {
  const stream = await openServerSentEventStream(
    `${SERVER_URL}/app-events/stream?token=${token}`,
  );
  const getOccurrences = (): EventOccurrence[] =>
    stream.receivedEvents
      .filter(({ event }) => event === 'occurrence')
      .map(({ data }) => JSON.parse(data));

  return {
    ...stream,
    getOccurrences,
    readOccurrences: (count: number) =>
      stream.readUntil(() => getOccurrences().length >= count),
  };
};

const openMemberStream = async ({
  applicationToken,
  subscriptions,
}: {
  applicationToken: string;
  subscriptions: Record<string, unknown>[];
}) => {
  const stream = await openServerSentEventStream(`${SERVER_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${applicationToken}`,
    },
    body: JSON.stringify({
      query: ON_APP_EVENT_SUBSCRIPTION,
      variables: { input: { subscriptions } },
    }),
  });
  const getMessages = (): AppEventStreamMessage[] =>
    stream.receivedEvents
      .filter(({ event }) => event === 'next')
      .map(({ data }) => JSON.parse(data));

  return {
    ...stream,
    getMessages,
    readMessages: (count: number) =>
      stream.readUntil(() => getMessages().length >= count),
  };
};

describe('app events realtime (e2e)', () => {
  let applicationToken: string;
  let companyId: string;

  const emit = (input: Record<string, unknown>) =>
    makeMetadataApiRequest(
      { query: EMIT_APP_EVENT_MUTATION, variables: { input } },
      applicationToken,
    );

  const createVisitorToken = async (anonymousId: string) => {
    const response = await makeMetadataApiRequest(
      {
        query: CREATE_APP_VISITOR_EVENT_TOKEN_MUTATION,
        variables: { input: { anonymousId, events: ['messageAdded'] } },
      },
      applicationToken,
    );

    return response.body.data.createAppVisitorEventToken.token as string;
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: TEST_APP_ID,
      name: 'Test Application',
      description: 'App for testing realtime events',
      sourcePath: 'test-app-events-realtime',
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
        capabilities: MESSAGE_ADDED_EVENT.capabilities,
      },
    ]);
  });

  it('refuses a record scope on a property that is not a record reference', async () => {
    await syncEvents({
      events: [
        {
          ...MESSAGE_ADDED_EVENT,
          capabilities: {
            realtime: { scopes: [{ kind: 'record', property: 'text' }] },
          },
        },
      ],
      expectToFail: true,
    });
  });

  it('refuses properties that do not match the definition', async () => {
    const response = await emit({
      event: 'messageAdded',
      properties: { companyId: 'not-a-uuid' },
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('refuses an anonymousId that could escape its channel', async () => {
    const response = await emit({
      event: 'messageAdded',
      properties: { companyId },
      anonymousId: 'visitor-1:record:other',
    });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('refuses an event the application did not declare', async () => {
    const response = await emit({ event: 'somethingElse' });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
  });

  it('delivers an occurrence only to the visitor it was emitted for', async () => {
    const visitorStream = await openVisitorStream(
      await createVisitorToken('visitor-1'),
    );
    const otherVisitorStream = await openVisitorStream(
      await createVisitorToken('visitor-2'),
    );

    expect(visitorStream.response.status).toBe(200);
    expect(visitorStream.response.headers.get('content-type')).toContain(
      'text/event-stream',
    );

    const emitResponse = await emit({
      event: 'messageAdded',
      properties: { companyId, text: 'Hello' },
      anonymousId: 'visitor-1',
    });

    await emit({
      event: 'messageAdded',
      properties: { companyId, text: 'Hello other visitor' },
      anonymousId: 'visitor-2',
    });

    await visitorStream.readOccurrences(1);
    await otherVisitorStream.readOccurrences(1);

    expect(visitorStream.getOccurrences()[0]).toEqual({
      id: emitResponse.body.data.emitAppEvent.id,
      type: 'messageAdded',
      occurredAt: emitResponse.body.data.emitAppEvent.occurredAt,
      properties: { companyId, text: 'Hello' },
    });
    expect(otherVisitorStream.getOccurrences()[0]?.properties).toEqual({
      companyId,
      text: 'Hello other visitor',
    });

    visitorStream.close();
    otherVisitorStream.close();
  });

  it('refuses a missing or tampered visitor token', async () => {
    const missingTokenResponse = await fetch(`${SERVER_URL}/app-events/stream`);
    const [header, payload, signature] = (
      await createVisitorToken('visitor-1')
    ).split('.');
    const tamperedSignature = `${signature.startsWith('A') ? 'B' : 'A'}${signature.slice(1)}`;
    const tamperedTokenResponse = await fetch(
      `${SERVER_URL}/app-events/stream?token=${header}.${payload}.${tamperedSignature}`,
    );

    expect(missingTokenResponse.status).toBe(401);
    expect(tamperedTokenResponse.status).toBe(401);

    await missingTokenResponse.text();
    await tamperedTokenResponse.text();
  });

  it('does not accept a visitor token as an API credential', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: EMIT_APP_EVENT_MUTATION,
        variables: { input: { event: 'messageAdded' } },
      },
      await createVisitorToken('visitor-1'),
    );

    expect(response.body.data?.emitAppEvent ?? null).toBeNull();
    expect(response.body.errors?.length).toBeGreaterThan(0);
  });

  it('streams record-scoped occurrences to a member who can read the record', async () => {
    const memberStream = await openMemberStream({
      applicationToken,
      subscriptions: [{ event: 'messageAdded', recordId: companyId }],
    });

    expect(memberStream.response.status).toBe(200);

    await memberStream.readMessages(1);

    expect(memberStream.getMessages()[0]).toEqual({
      data: { onAppEvent: { occurrence: null } },
    });

    const emitResponse = await emit({
      event: 'messageAdded',
      properties: { companyId, text: 'Hello team' },
    });

    await memberStream.readMessages(2);

    expect(memberStream.getMessages()[1]).toEqual({
      data: {
        onAppEvent: {
          occurrence: {
            id: emitResponse.body.data.emitAppEvent.id,
            type: 'messageAdded',
            occurredAt: emitResponse.body.data.emitAppEvent.occurredAt,
            properties: { companyId, text: 'Hello team' },
          },
        },
      },
    });

    memberStream.close();
  });

  it('refuses a member subscription whose recordId is not a UUID', async () => {
    const memberStream = await openMemberStream({
      applicationToken,
      subscriptions: [{ event: 'messageAdded', recordId: 'company-1' }],
    });

    await memberStream.readMessages(1);

    expect(memberStream.getMessages()[0]?.data ?? null).toBeNull();
    expect(memberStream.getMessages()[0]?.errors?.length).toBeGreaterThan(0);

    memberStream.close();
  });

  it('refuses a member subscription to a record they cannot read', async () => {
    const memberStream = await openMemberStream({
      applicationToken,
      subscriptions: [{ event: 'messageAdded', recordId: uuidv4() }],
    });

    await memberStream.readMessages(1);

    expect(memberStream.getMessages()[0]?.errors?.[0]?.extensions?.code).toBe(
      'FORBIDDEN',
    );

    memberStream.close();
  });
});
