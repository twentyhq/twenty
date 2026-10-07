import { randomUUID } from 'node:crypto';

import { addMonths, startOfMonth } from 'date-fns';
import {
  getSeededBillingWorkspaceId,
  quitBillingFixtureRedis,
  resetBillingCreditState,
  setSubscriptionStatus,
  setupResourceCreditSubscription,
  TEST_STRIPE_SUBSCRIPTION_ID,
  warmAllowanceCounter,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { postStripeEntitlementSummary } from 'test/integration/billing/utils/post-stripe-entitlement-summary.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { makeAdminPanelApiRequest } from 'test/integration/twenty-config/utils/make-admin-panel-api-request.util';
import { buildTestQuotaCounterKey } from 'test/integration/usage-limit/utils/build-test-quota-counter-key.util';
import { destroyAgentChatThread } from 'test/integration/utils/destroy-agent-chat-thread.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';

import { gql } from 'graphql-tag';
import { createClient as createRedisClient } from 'redis';
import { AUTO_SELECT_MODEL_ID_BY_TIER } from 'twenty-shared/ai';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { buildQuotaCounterKey } from 'src/engine/core-modules/usage-limit/utils/build-quota-counter-key.util';
import { getCalendarDayPeriod } from 'src/engine/core-modules/usage-limit/utils/get-calendar-day-period.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { WorkspaceSetupChatOutcome } from 'src/engine/metadata-modules/ai/ai-chat/enums/workspace-setup-chat-outcome.enum';
import { type AgentChatService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat.service';
import { type AgentChatThreadService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread.service';
import { buildWorkspaceSetupChatThreadId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-workspace-setup-chat-thread-id.util';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const PERIOD_START = startOfMonth(new Date());
const PERIOD_END = addMonths(PERIOD_START, 1);
const ALLOWANCE_MICRO = 1_000_000;
const OVERRIDE_DAILY_CEILING_MICRO = 2_000_000;

const INCLUDED_FAST_MODEL_ID = 'test-provider/included-fast-model@medium';
const PAID_SMART_MODEL_ID = 'test-provider/paid-smart-model';

const SEND_CHAT_MESSAGE = gql`
  mutation SendChatMessage(
    $threadId: UUID!
    $text: String!
    $messageId: UUID!
    $modelId: String
  ) {
    sendChatMessage(
      threadId: $threadId
      text: $text
      messageId: $messageId
      modelId: $modelId
    ) {
      messageId
      queued
      streamId
      isIncluded
    }
  }
`;

const CHAT_MESSAGES = gql`
  query ChatMessages($threadId: UUID!) {
    chatMessages(threadId: $threadId) {
      id
      status
    }
  }
`;

const CURRENT_WORKSPACE_CHAT_MODEL_TIER = gql`
  query CurrentWorkspaceChatModelTier {
    currentUser {
      currentWorkspace {
        aiChatModelTier
      }
    }
  }
`;

const UPDATE_WORKSPACE_CHAT_MODEL_TIER = gql`
  mutation UpdateWorkspaceChatModelTier($aiChatModelTier: AiModelTier!) {
    updateWorkspace(data: { aiChatModelTier: $aiChatModelTier }) {
      id
    }
  }
`;

const START_WORKSPACE_SETUP_CHAT = gql`
  mutation StartWorkspaceSetupChat {
    startWorkspaceSetupChat {
      outcome
    }
  }
`;

const CREATE_WORKSPACE_USAGE_LIMIT = gql`
  mutation CreateWorkspaceUsageLimit(
    $workspaceId: UUID!
    $payload: CreateUsageLimitInput!
  ) {
    createWorkspaceUsageLimit(workspaceId: $workspaceId, payload: $payload) {
      id
    }
  }
`;

const DELETE_WORKSPACE_USAGE_LIMIT = gql`
  mutation DeleteWorkspaceUsageLimit(
    $workspaceId: UUID!
    $usageLimitId: UUID!
  ) {
    deleteWorkspaceUsageLimit(
      workspaceId: $workspaceId
      usageLimitId: $usageLimitId
    )
  }
`;

const findGrantedLookupKeys = async (
  workspaceId: string,
): Promise<string[]> => {
  const grantedRows: { key: string }[] = await global.testDataSource.query(
    `SELECT key FROM core."billingEntitlement" WHERE "workspaceId" = $1 AND value = true`,
    [workspaceId],
  );

  return grantedRows.map(({ key }) => key);
};

describe('Included AI chat (integration)', () => {
  let workspaceId: string;
  let originalLookupKeys: string[];
  let originalChatModelTier: string;
  let originalSubscriptionStatus: SubscriptionStatus;
  let redis: Awaited<ReturnType<typeof createRedisClient>>;
  let enqueueStream: jest.SpyInstance;
  const spies: jest.SpyInstance[] = [];
  const threadIds: string[] = [];

  const createThread = async (): Promise<string> => {
    const threadId = randomUUID();

    await getAppProviderByClassName<AgentChatThreadService>(
      'AgentChatThreadService',
    ).createThread({
      workspaceId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      id: threadId,
      title: 'Included chat',
    });

    threadIds.push(threadId);

    return threadId;
  };

  const sendChatMessage = ({
    threadId,
    messageId = randomUUID(),
    modelId,
    token,
  }: {
    threadId: string;
    messageId?: string;
    modelId?: string;
    token?: string;
  }) =>
    makeMetadataApiRequest(
      {
        query: SEND_CHAT_MESSAGE,
        variables: {
          threadId,
          text: 'Summarize my pipeline',
          messageId,
          modelId,
        },
      },
      token,
    );

  const findThreadMessageStatusById = async (
    threadId: string,
  ): Promise<Record<string, string>> => {
    const response = await makeMetadataApiRequest({
      query: CHAT_MESSAGES,
      variables: { threadId },
    });

    expect(response.body.errors).toBeUndefined();

    return Object.fromEntries(
      response.body.data.chatMessages.map(
        ({ id, status }: { id: string; status: string }) => [id, status],
      ),
    );
  };

  const findThreadMessageIds = async (threadId: string): Promise<string[]> =>
    Object.keys(await findThreadMessageStatusById(threadId));

  const queueChatMessage = async (threadId: string): Promise<string> => {
    const queuedMessage = await getAppProviderByClassName<AgentChatService>(
      'AgentChatService',
    ).queueMessage({
      threadId,
      text: 'Then list my open deals',
      workspaceId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    });

    return queuedMessage.id;
  };

  const setWorkspaceActivationStatus = async (
    activationStatus: WorkspaceActivationStatus,
  ) => {
    await global.testDataSource.query(
      `UPDATE core."workspace" SET "activationStatus" = $1 WHERE id = $2`,
      [activationStatus, workspaceId],
    );
    await getAppProviderByClassName<CoreEntityCacheService>(
      'CoreEntityCacheService',
    ).invalidate('workspaceEntity', workspaceId);
  };

  const setChatModelTier = async (aiChatModelTier: string) => {
    const response = await makeMetadataApiRequest({
      query: UPDATE_WORKSPACE_CHAT_MODEL_TIER,
      variables: { aiChatModelTier },
    });

    expect(response.body.errors).toBeUndefined();
  };

  const exhaustIncludedChatCeiling = async (): Promise<string> => {
    const response = await makeAdminPanelApiRequest({
      query: CREATE_WORKSPACE_USAGE_LIMIT,
      variables: {
        workspaceId,
        payload: {
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          spenderType: 'workspace',
          spenderId: null,
          limitKind: 'quota',
          periodCount: 1,
          periodUnit: 'day',
          unit: UsageUnit.CREDIT,
          limitValue: OVERRIDE_DAILY_CEILING_MICRO,
          burstValue: null,
        },
      },
    });

    expect(response.body.errors).toBeUndefined();

    const usageLimitId = response.body.data?.createWorkspaceUsageLimit?.id;

    jestExpectToBeDefined(usageLimitId);

    await redis.set(
      buildTestQuotaCounterKey(
        buildQuotaCounterKey({
          workspaceId,
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_INCLUDED,
          spenderType: 'workspace',
          spenderId: null,
          unit: UsageUnit.CREDIT,
          periodUnit: 'day',
          periodStart: getCalendarDayPeriod(new Date()).periodStart,
          limitValue: OVERRIDE_DAILY_CEILING_MICRO,
        }),
      ),
      '0',
    );

    return usageLimitId;
  };

  const deleteIncludedChatCeilingOverride = (usageLimitId: string) =>
    makeAdminPanelApiRequest({
      query: DELETE_WORKSPACE_USAGE_LIMIT,
      variables: { workspaceId, usageLimitId },
    });

  const deleteIncludedChatCacheKeys = async () => {
    const keys = [
      ...(await redis.keys(`*usageLimits:${workspaceId}*`)),
      ...(await redis.keys(
        `*{${workspaceId}}:quota:${UsageResourceType.AI}:${UsageOperationType.AI_CHAT_INCLUDED}:*`,
      )),
    ];

    if (isNonEmptyArray(keys)) {
      await redis.del(keys);
    }
  };

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();

    // Every request below reads as Jane, so a grant on another workspace would never be read back
    if (workspaceId !== SEED_APPLE_WORKSPACE_ID) {
      throw new Error(
        `The seeded billing customer belongs to workspace ${workspaceId}, not to the Apple workspace the access token reads`,
      );
    }

    redis = await createRedisClient({ url: process.env.REDIS_URL }).connect();

    originalLookupKeys = (await findGrantedLookupKeys(workspaceId)).filter(
      (key) => key !== BillingEntitlementKey.INCLUDED_FAST_MODEL,
    );

    const [subscription]: { status: SubscriptionStatus }[] =
      await global.testDataSource.query(
        `SELECT status FROM core."billingSubscription" WHERE "workspaceId" = $1 AND "stripeSubscriptionId" = $2`,
        [workspaceId, TEST_STRIPE_SUBSCRIPTION_ID],
      );

    originalSubscriptionStatus = subscription.status;

    const tierResponse = await makeMetadataApiRequest({
      query: CURRENT_WORKSPACE_CHAT_MODEL_TIER,
    });

    originalChatModelTier =
      tierResponse.body.data.currentUser.currentWorkspace.aiChatModelTier;

    await postStripeEntitlementSummary([
      ...originalLookupKeys,
      BillingEntitlementKey.INCLUDED_FAST_MODEL,
    ]);

    await createConfigVariable({
      input: { key: 'AI_MODELS_DEFAULT_FAST', value: [INCLUDED_FAST_MODEL_ID] },
    });
    await createConfigVariable({
      input: { key: 'AI_MODELS_DEFAULT_SMART', value: [PAID_SMART_MODEL_ID] },
    });

    const aiModelRegistryService =
      getAppProviderByClassName<AiModelRegistryService>(
        'AiModelRegistryService',
      );
    const availableModelIds = [INCLUDED_FAST_MODEL_ID, PAID_SMART_MODEL_ID];

    // No provider key is configured in tests, so availability is stubbed
    spies.push(
      jest
        .spyOn(aiModelRegistryService, 'getModel')
        .mockImplementation((modelId: string) =>
          availableModelIds.includes(modelId)
            ? ({ modelId } as never)
            : undefined,
        ),
      jest
        .spyOn(aiModelRegistryService, 'getAvailableModels')
        .mockReturnValue(
          availableModelIds.map((modelId) => ({ modelId })) as never,
        ),
    );

    enqueueStream = jest
      .spyOn(
        global.app.get<MessageQueueService>(
          getQueueToken(MessageQueue.aiStreamQueue),
        ),
        'add',
      )
      .mockResolvedValue(undefined as never);
    spies.push(enqueueStream);

    // The workspace tier resolves to a paid model, so only an exhausted allowance can make a send included
    await setChatModelTier('smart');
  });

  beforeEach(async () => {
    enqueueStream.mockClear();

    await resetBillingCreditState(workspaceId);
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
    });
    await warmAllowanceCounter(workspaceId, PERIOD_START, 0);
  });

  afterEach(async () => {
    await deleteIncludedChatCacheKeys();

    for (const threadId of threadIds.splice(0)) {
      await destroyAgentChatThread({ threadId });
    }
  });

  afterAll(async () => {
    spies.forEach((spy) => spy.mockRestore());

    await setChatModelTier(originalChatModelTier);
    await deleteConfigVariable({ input: { key: 'AI_MODELS_DEFAULT_FAST' } });
    await deleteConfigVariable({ input: { key: 'AI_MODELS_DEFAULT_SMART' } });
    await postStripeEntitlementSummary(originalLookupKeys);

    await setSubscriptionStatus(workspaceId, originalSubscriptionStatus);
    await resetBillingCreditState(workspaceId);
    await quitBillingFixtureRedis();
    await redis.quit();
  });

  it('admits a send that follows the workspace tier on the included model once the allowance is exhausted', async () => {
    const threadId = await createThread();

    const response = await sendChatMessage({ threadId });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage).toMatchObject({
      queued: false,
      streamId: expect.any(String),
      isIncluded: true,
    });
    expect(enqueueStream).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ threadId }),
    );
  });

  it('admits a send on the included model itself while the allowance has room', async () => {
    await warmAllowanceCounter(workspaceId, PERIOD_START, ALLOWANCE_MICRO);

    const threadId = await createThread();

    const response = await sendChatMessage({
      threadId,
      modelId: AUTO_SELECT_MODEL_ID_BY_TIER.fast,
    });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.isIncluded).toBe(true);
  });

  it('bills a send on a paid tier while the allowance has room', async () => {
    await warmAllowanceCounter(workspaceId, PERIOD_START, ALLOWANCE_MICRO);

    const threadId = await createThread();

    const response = await sendChatMessage({ threadId });

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.sendChatMessage.isIncluded).toBe(false);
  });

  it('refuses a paid tier picked explicitly once the allowance is exhausted, without saving the message', async () => {
    const threadId = await createThread();
    const messageId = randomUUID();

    const response = await sendChatMessage({
      threadId,
      messageId,
      modelId: AUTO_SELECT_MODEL_ID_BY_TIER.smart,
    });

    expect(response.body.errors?.[0]?.extensions).toMatchObject({
      code: 'QUOTA_EXHAUSTED',
      exhaustedKind: 'allowance',
    });
    expect(await findThreadMessageIds(threadId)).not.toContain(messageId);
    expect(enqueueStream).not.toHaveBeenCalled();
  });

  it('pauses included chat past the fair-use ceiling, without saving the message or exposing the ceiling', async () => {
    const usageLimitId = await exhaustIncludedChatCeiling();

    try {
      const threadId = await createThread();
      const messageId = randomUUID();

      const response = await sendChatMessage({ threadId, messageId });

      const extensions = response.body.errors?.[0]?.extensions;

      expect(extensions).toMatchObject({
        code: 'QUOTA_EXHAUSTED',
        subCode: 'INCLUDED_CHAT_PAUSED',
      });
      expect(extensions).not.toHaveProperty('limit');
      expect(extensions).not.toHaveProperty('remaining');
      expect(await findThreadMessageIds(threadId)).not.toContain(messageId);
      expect(enqueueStream).not.toHaveBeenCalled();
    } finally {
      await deleteIncludedChatCeilingOverride(usageLimitId);
    }
  });

  it('keeps a workspace without an active subscription blocked, as NO_SUBSCRIPTION', async () => {
    await setSubscriptionStatus(workspaceId, SubscriptionStatus.Canceled);
    await resetBillingCreditState(workspaceId);

    const threadId = await createThread();

    const response = await sendChatMessage({ threadId });

    const serializedErrors = JSON.stringify(response.body.errors);

    expect(serializedErrors).toContain('BILLING_SUBSCRIPTION_INACTIVE');
    expect(serializedErrors).toContain('NO_SUBSCRIPTION');
    expect(enqueueStream).not.toHaveBeenCalled();
  });

  // The suspended-workspace guard answers before the chat plans the turn, so the billing WORKSPACE_SUSPENDED reason is unreachable here
  it('keeps a suspended workspace blocked', async () => {
    const threadId = await createThread();

    await setWorkspaceActivationStatus(WorkspaceActivationStatus.SUSPENDED);

    try {
      const response = await sendChatMessage({ threadId });

      expect(JSON.stringify(response.body.errors)).toContain(
        'WORKSPACE_SUSPENDED',
      );
      expect(enqueueStream).not.toHaveBeenCalled();
    } finally {
      await setWorkspaceActivationStatus(WorkspaceActivationStatus.ACTIVE);
    }
  });

  describe('sent by an application on behalf of a member', () => {
    let application: ApplicationWithResources;
    let applicationAccessToken: string;

    beforeAll(async () => {
      application = await setupApplicationWithResources({
        name: 'Included Chat Application',
        permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
      });
      jest.useRealTimers();

      const tokenPair = await generateAppleAdminApplicationTokenPair({
        applicationId: application.id,
      });

      applicationAccessToken = tokenPair.applicationAccessToken.token;
    });

    afterAll(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    });

    it.each([
      ['on the included model', AUTO_SELECT_MODEL_ID_BY_TIER.fast],
      ['that follows the workspace tier', undefined],
    ])(
      'refuses a send %s once the allowance is exhausted, since only member sessions are included',
      async (_, modelId) => {
        const threadId = await createThread();

        const response = await sendChatMessage({
          threadId,
          modelId,
          token: applicationAccessToken,
        });

        expect(response.body.errors?.[0]?.extensions).toMatchObject({
          code: 'QUOTA_EXHAUSTED',
          exhaustedKind: 'allowance',
        });
        expect(enqueueStream).not.toHaveBeenCalled();
      },
    );

    it('bills a send on the included model while the allowance has room', async () => {
      await warmAllowanceCounter(workspaceId, PERIOD_START, ALLOWANCE_MICRO);

      const threadId = await createThread();

      const response = await sendChatMessage({
        threadId,
        modelId: AUTO_SELECT_MODEL_ID_BY_TIER.fast,
        token: applicationAccessToken,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.sendChatMessage.isIncluded).toBe(false);
    });
  });

  describe('a queued backlog', () => {
    // Queued messages carry no model id, so on this tier they run on the included model
    beforeAll(async () => {
      await setChatModelTier('fast');
    });

    afterAll(async () => {
      await setChatModelTier('smart');
    });

    beforeEach(async () => {
      await warmAllowanceCounter(workspaceId, PERIOD_START, ALLOWANCE_MICRO);
    });

    it('lets a send on a paid model run past a backlog the pause holds, which stays queued', async () => {
      const usageLimitId = await exhaustIncludedChatCeiling();

      try {
        const threadId = await createThread();
        const queuedMessageId = await queueChatMessage(threadId);
        const messageId = randomUUID();

        const response = await sendChatMessage({
          threadId,
          messageId,
          modelId: AUTO_SELECT_MODEL_ID_BY_TIER.smart,
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.sendChatMessage).toMatchObject({
          queued: false,
          isIncluded: false,
        });
        expect(enqueueStream).toHaveBeenCalledTimes(1);
        expect(enqueueStream).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ messageId }),
        );
        expect(await findThreadMessageStatusById(threadId)).toMatchObject({
          [queuedMessageId]: 'queued',
        });
      } finally {
        await deleteIncludedChatCeilingOverride(usageLimitId);
      }
    });

    it('queues a send behind a backlog the pause does not hold, and runs the backlog first', async () => {
      const threadId = await createThread();
      const queuedMessageId = await queueChatMessage(threadId);

      const response = await sendChatMessage({
        threadId,
        modelId: AUTO_SELECT_MODEL_ID_BY_TIER.smart,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.sendChatMessage.queued).toBe(true);
      expect(enqueueStream).toHaveBeenCalledTimes(1);
      expect(enqueueStream).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ messageId: queuedMessageId }),
      );
    });
  });

  describe('workspace setup chat', () => {
    const setupThreadId = buildWorkspaceSetupChatThreadId({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
    let isWorkspaceCreatorSpy: jest.SpyInstance;

    beforeAll(async () => {
      await createConfigVariable({
        input: { key: 'IS_ONBOARDING_AI_CHAT_ENABLED', value: true },
      });

      // Only the workspace creator gets the setup chat, and the seeded creator has no test token
      isWorkspaceCreatorSpy = jest
        .spyOn(
          getAppProviderByClassName<UserWorkspaceService>(
            'UserWorkspaceService',
          ),
          'isWorkspaceCreator',
        )
        .mockResolvedValue(true);
    });

    afterEach(async () => {
      await destroyAgentChatThread({ threadId: setupThreadId }).catch(() => {});
    });

    afterAll(async () => {
      isWorkspaceCreatorSpy.mockRestore();
      await deleteConfigVariable({
        input: { key: 'IS_ONBOARDING_AI_CHAT_ENABLED' },
      });
    });

    it('starts on the included model once the allowance is exhausted', async () => {
      const response = await makeMetadataApiRequest({
        query: START_WORKSPACE_SETUP_CHAT,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.startWorkspaceSetupChat.outcome).toBe(
        WorkspaceSetupChatOutcome.STARTED,
      );
    });

    it('is unavailable past the fair-use ceiling', async () => {
      const usageLimitId = await exhaustIncludedChatCeiling();

      try {
        const response = await makeMetadataApiRequest({
          query: START_WORKSPACE_SETUP_CHAT,
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.startWorkspaceSetupChat.outcome).toBe(
          WorkspaceSetupChatOutcome.UNAVAILABLE,
        );
      } finally {
        await deleteIncludedChatCeilingOverride(usageLimitId);
      }
    });
  });
});
