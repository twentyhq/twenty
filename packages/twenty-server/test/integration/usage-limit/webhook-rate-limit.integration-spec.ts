import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import {
  createWebhook,
  createWebhookReceiver,
  deleteWebhook,
} from 'test/integration/metadata/suites/utils/webhook-test.util';
import { makeAdminPanelAPIRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { gql } from 'graphql-tag';
import { createClient } from 'redis';
import { FeatureFlagKey } from 'twenty-shared/types';
import { type Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UsageLimitEntity } from 'src/engine/core-modules/usage-limit/usage-limit.entity';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const WEBHOOK_RECEIVER_PORT = 4318;
const WINDOW_SECONDS = 60;
const LIMIT_VALUE = 2;
const PERSON_COUNT = 5;

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

describe('Webhook rate limiting', () => {
  let usageLimitRepository: Repository<UsageLimitEntity>;
  let featureFlagRepository: Repository<FeatureFlagEntity>;
  let redis: Awaited<ReturnType<typeof createClient>>;
  let usageLimitId: string;
  let webhookId: string;
  let receiver: Awaited<ReturnType<typeof createWebhookReceiver>>;

  const createdPersonIds: string[] = [];

  const invalidateWorkspaceCaches = async () => {
    const keys = [
      ...(await redis.keys(`*featureFlagsMap:${SEED_APPLE_WORKSPACE_ID}*`)),
      ...(await redis.keys(`*usageLimits:${SEED_APPLE_WORKSPACE_ID}*`)),
    ];

    if (keys.length > 0) {
      await redis.del(keys);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  const createPerson = async (lastName: string) => {
    const response = await makeGraphqlAPIRequest({
      query: CREATE_PERSON_MUTATION,
      variables: { data: { name: { firstName: 'WebhookThrottle', lastName } } },
    });

    expect(response.body.errors).toBeUndefined();
    createdPersonIds.push(response.body.data.createPerson.id);
  };

  beforeAll(async () => {
    jest.useRealTimers();

    usageLimitRepository =
      getCoreRepository<UsageLimitEntity>(UsageLimitEntity);
    featureFlagRepository =
      getCoreRepository<FeatureFlagEntity>(FeatureFlagEntity);
    redis = await createClient({ url: process.env.REDIS_URL }).connect();

    await makeAdminPanelAPIRequest({
      query: CREATE_CONFIG_VARIABLE_MUTATION,
      variables: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED', value: false },
    });

    await featureFlagRepository.delete({
      key: FeatureFlagKey.IS_WEBHOOK_RATE_LIMIT_ENABLED,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    await featureFlagRepository.save({
      key: FeatureFlagKey.IS_WEBHOOK_RATE_LIMIT_ENABLED,
      value: true,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

    const [usageLimit] = await usageLimitRepository.save([
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        resourceType: UsageResourceType.WEBHOOK,
        operationType: UsageOperationType.WEBHOOK_CALL,
        spenderType: 'workspace',
        spenderId: '',
        limitKind: 'speed',
        periodCount: WINDOW_SECONDS,
        periodUnit: 'second',
        meter: 'quantity',
        limitValue: LIMIT_VALUE,
        burstValue: LIMIT_VALUE,
      },
    ]);

    usageLimitId = usageLimit.id;

    await invalidateWorkspaceCaches();

    receiver = await createWebhookReceiver(WEBHOOK_RECEIVER_PORT);

    const createWebhookResponse = await createWebhook({
      targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
      operations: ['person.created'],
      description: 'Webhook rate limiting test webhook',
      secret: 'test-secret',
    });

    expect(createWebhookResponse.body.errors).toBeUndefined();
    webhookId = createWebhookResponse.body.data.createWebhook.id;
  });

  afterAll(async () => {
    await receiver.close();
    await deleteWebhook(webhookId).catch(() => {});

    for (const personId of createdPersonIds) {
      await makeGraphqlAPIRequest({
        query: DESTROY_PERSON_MUTATION,
        variables: { id: personId },
      }).catch(() => {});
    }

    await usageLimitRepository.delete({ id: usageLimitId });
    await featureFlagRepository.delete({
      key: FeatureFlagKey.IS_WEBHOOK_RATE_LIMIT_ENABLED,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    await makeAdminPanelAPIRequest({
      query: DELETE_CONFIG_VARIABLE_MUTATION,
      variables: { key: 'OUTBOUND_HTTP_SAFE_MODE_ENABLED' },
    }).catch(() => {});

    await invalidateWorkspaceCaches();
    await redis.quit();
    jest.useFakeTimers();
  });

  it('delivers what the bucket admits and drops the rest of the burst', async () => {
    const testId = uuidv4().slice(0, 8);

    for (let personIndex = 0; personIndex < PERSON_COUNT; personIndex++) {
      await createPerson(`Test-${testId}-${personIndex}`);
    }

    await expectEventually(
      () => {
        expect(receiver.receivedPayloads.length).toBe(LIMIT_VALUE);
      },
      { timeoutMs: 30_000, intervalMs: 100 },
    );

    await new Promise((resolve) => setTimeout(resolve, 2_000));

    expect(receiver.receivedPayloads.length).toBe(LIMIT_VALUE);
    expect(receiver.receivedPayloads[0]).toMatchObject({
      targetUrl: `http://127.0.0.1:${WEBHOOK_RECEIVER_PORT}/webhook`,
      eventName: 'person.created',
    });
  }, 60_000);
});
