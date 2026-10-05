import process from 'process';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient,
} from '@clickhouse/client';
import { gql } from 'graphql-tag';
import { v4 as uuidv4 } from 'uuid';

import { WEBHOOK_RESPONSE_EVENT } from 'src/engine/core-modules/event-logs/emit/events/workspace-event/webhook/webhook-response';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createWebhook,
  createWebhookReceiver,
  deleteWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';

const WEBHOOK_RECEIVER_PORT = 4319;
const UNREACHABLE_WEBHOOK_PORT = 4321;

const CREATE_CONFIG_VARIABLE_MUTATION = gql`
  mutation CreateDatabaseConfigVariable($key: String!, $value: JSON!) {
    createDatabaseConfigVariable(key: $key, value: $value)
  }
`;

const DELETE_CONFIG_VARIABLE_MUTATION = gql`
  mutation DeleteDatabaseConfigVariable($key: String!) {
    deleteDatabaseConfigVariable(key: $key)
  }
`;

const CREATE_PERSON_MUTATION = gql`
  mutation CreatePerson($data: PersonCreateInput!) {
    createPerson(data: $data) {
      id
    }
  }
`;

const DESTROY_PERSON_MUTATION = gql`
  mutation DestroyPerson($id: ID!) {
    destroyPerson(id: $id) {
      id
    }
  }
`;

type WebhookResponseRow = {
  timestamp: string;
  properties: {
    webhookId: string;
    success: boolean;
    status?: number | string;
  };
};

describe('Webhook response event write (integration)', () => {
  let clickHouseClient: ClickHouseClient;
  let receiver: Awaited<ReturnType<typeof createWebhookReceiver>>;
  let reachableWebhookId: string;
  let unreachableWebhookId: string;
  let personId: string | undefined;

  const queryWebhookResponseRows = async () => {
    const result = await clickHouseClient.query({
      query: `
        SELECT timestamp, properties
        FROM workspaceEvent
        WHERE event = '${WEBHOOK_RESPONSE_EVENT}' AND workspaceId = '${SEED_APPLE_WORKSPACE_ID}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await result.json<WebhookResponseRow>();

    return rows.filter(({ properties }) =>
      [reachableWebhookId, unreachableWebhookId].includes(properties.webhookId),
    );
  };

  beforeAll(async () => {
    jest.useRealTimers();

    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
      log: { level: ClickHouseLogLevel.OFF },
    });

    await makeAdminPanelApiRequest({
      query: CREATE_CONFIG_VARIABLE_MUTATION,
      variables: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: ['*'] },
    });

    receiver = await createWebhookReceiver(WEBHOOK_RECEIVER_PORT);

    const reachableWebhookResponse = await createWebhook({
      targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
      operations: ['person.created'],
      description: 'Webhook response write test (reachable)',
    });

    expect(reachableWebhookResponse.body.errors).toBeUndefined();
    reachableWebhookId = reachableWebhookResponse.body.data.createWebhook.id;

    const unreachableWebhookResponse = await createWebhook({
      targetUrl: `http://127.0.0.1:${UNREACHABLE_WEBHOOK_PORT}/webhook`,
      operations: ['person.created'],
      description: 'Webhook response write test (unreachable)',
    });

    expect(unreachableWebhookResponse.body.errors).toBeUndefined();
    unreachableWebhookId =
      unreachableWebhookResponse.body.data.createWebhook.id;
  });

  afterAll(async () => {
    await receiver.close();
    await deleteWebhook(reachableWebhookId).catch(() => {});
    await deleteWebhook(unreachableWebhookId).catch(() => {});

    if (personId) {
      await makeGraphqlApiRequest({
        query: DESTROY_PERSON_MUTATION,
        variables: { id: personId },
      }).catch(() => {});
    }

    await makeAdminPanelApiRequest({
      query: DELETE_CONFIG_VARIABLE_MUTATION,
      variables: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS' },
    }).catch(() => {});

    await clickHouseClient.command({
      query: `ALTER TABLE workspaceEvent DELETE WHERE event = '${WEBHOOK_RESPONSE_EVENT}' AND workspaceId = '${SEED_APPLE_WORKSPACE_ID}'`,
    });
    await clickHouseClient.close();

    jest.useFakeTimers();
  });

  it('records one response row per webhook call, successful and failed alike', async () => {
    const createPersonResponse = await makeGraphqlApiRequest({
      query: CREATE_PERSON_MUTATION,
      variables: {
        data: {
          name: {
            firstName: 'WebhookResponse',
            lastName: `Test-${uuidv4().slice(0, 8)}`,
          },
        },
      },
    });

    expect(createPersonResponse.body.errors).toBeUndefined();
    personId = createPersonResponse.body.data.createPerson.id;

    await expectEventually(
      async () => {
        expect(await queryWebhookResponseRows()).toHaveLength(2);
      },
      { timeoutMs: 30_000, intervalMs: 500 },
    );

    const rows = await queryWebhookResponseRows();
    const reachableRow = rows.find(
      ({ properties }) => properties.webhookId === reachableWebhookId,
    );
    const unreachableRow = rows.find(
      ({ properties }) => properties.webhookId === unreachableWebhookId,
    );

    expect(receiver.receivedPayloads).toHaveLength(1);
    expect(reachableRow?.properties.success).toBe(true);
    expect(Number(reachableRow?.properties.status)).toBe(200);
    expect(unreachableRow?.properties.success).toBe(false);
  }, 60_000);
});
