import { INTERNAL_CREDITS_PER_DISPLAY_CREDIT } from 'twenty-shared/constants';
import { randomUUID } from 'node:crypto';

import {
  type ClickHouseClient,
  ClickHouseLogLevel,
  createClient as createClickHouseClient,
} from '@clickhouse/client';
import { addDays, subDays } from 'date-fns';
import request from 'supertest';
import {
  debitInFlightCredits,
  flushQuotaCounters,
  getSeededBillingWorkspaceId,
  quitBillingFixtureRedis,
  readAllowanceConsumedMicro,
  refreshCurrentBillingSubscription,
  resetBillingCreditState,
  setupResourceCreditSubscription,
  TEST_STRIPE_SUBSCRIPTION_ITEM_ID,
} from 'test/integration/billing/utils/billing-credit-fixtures.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { formatDateTimeForClickHouse } from 'src/database/clickhouse/utils/format-date-time-for-clickhouse.util';
import { BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';

const client = request(`http://localhost:${APP_PORT}`);

const PERIOD_START = subDays(new Date(), 1);
const PERIOD_END = addDays(PERIOD_START, 30);
const ALLOWANCE_MICRO = 5 * INTERNAL_CREDITS_PER_DISPLAY_CREDIT;
const IN_FLIGHT_CREDITS_MICRO = 100;
const CLICKHOUSE_FLUSH_TIMEOUT_MS = 30_000;

const GRANT_MUTATION = `
  mutation GrantWorkspaceCredits(
    $workspaceId: UUID!
    $amount: Float!
    $type: BillingCreditGrantType!
    $clientOperationId: UUID!
  ) {
    grantWorkspaceCredits(
      workspaceId: $workspaceId
      amount: $amount
      type: $type
      clientOperationId: $clientOperationId
    ) {
      id
    }
  }
`;

const REVOKE_MUTATION = `
  mutation RevokeWorkspaceCreditGrant($workspaceId: UUID!, $creditGrantId: UUID!) {
    revokeWorkspaceCreditGrant(
      workspaceId: $workspaceId
      creditGrantId: $creditGrantId
    ) {
      id
    }
  }
`;

const callAdminGraphql = (query: string, variables: Record<string, unknown>) =>
  client
    .post('/admin-panel')
    .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
    .set('Content-Type', 'application/json')
    .send({ query, variables });

describe('Credit allowance enforcement (integration)', () => {
  let workspaceId: string;
  let clickHouseClient: ClickHouseClient;

  const getQuotaService = () =>
    getAppProviderByClassName<UsageLimitQuotaService>('UsageLimitQuotaService');

  const findAllowanceRefusal = (costMicro = 0) =>
    getQuotaService().findExhaustedScope({
      workspaceId,
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      spenders: {},
      cost: { [UsageUnit.CREDIT]: costMicro },
    });

  const readLedger = async (): Promise<{
    rowCount: number;
    creditsUsedMicro: number;
  }> => {
    const result = await clickHouseClient.query({
      query: `SELECT count() AS rowCount, sum(creditsUsedMicro) AS creditsUsedMicro
              FROM usageEvent
              WHERE workspaceId = {workspaceId:String}
                AND periodStart = {periodStart:DateTime64(3)}`,
      query_params: {
        workspaceId,
        periodStart: formatDateTimeForClickHouse(PERIOD_START),
      },
      format: 'JSONEachRow',
    });

    const [row] = await result.json<{
      rowCount: string;
      creditsUsedMicro: string;
    }>();

    return {
      rowCount: Number(row?.rowCount ?? 0),
      creditsUsedMicro: Number(row?.creditsUsedMicro ?? 0),
    };
  };

  const countLedgerRows = async (): Promise<number> =>
    (await readLedger()).rowCount;

  const recordAiUsage = async (creditsUsedMicro: number) => {
    const rowCountBefore = await countLedgerRows();

    await clickHouseClient.insert({
      table: 'usageEvent',
      values: [
        {
          timestamp: formatDateTimeForClickHouse(new Date()),
          periodStart: formatDateTimeForClickHouse(PERIOD_START),
          workspaceId,
          resourceType: UsageResourceType.AI,
          operationType: UsageOperationType.AI_CHAT_TOKEN,
          unit: UsageUnit.TOKEN,
          quantity: 1_000,
          creditsUsedMicro,
          metadata: {},
        },
      ],
      format: 'JSONEachRow',
    });

    await expectEventually(
      async () => {
        expect(await countLedgerRows()).toBe(rowCountBefore + 1);
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );
  };

  const grantCredits = async (amount: number): Promise<string> => {
    const response = await callAdminGraphql(GRANT_MUTATION, {
      workspaceId,
      amount,
      type: BillingCreditGrantType.COMPENSATION,
      clientOperationId: randomUUID(),
    });

    expect(response.body.errors).toBeUndefined();

    return response.body.data.grantWorkspaceCredits.id;
  };

  const setUpSubscription = async (
    overrides: Partial<Parameters<typeof setupResourceCreditSubscription>[0]>,
  ) => {
    await setupResourceCreditSubscription({
      workspaceId,
      periodStart: PERIOD_START,
      periodEnd: PERIOD_END,
      creditAmountMicro: ALLOWANCE_MICRO,
      ...overrides,
    });
    await refreshCurrentBillingSubscription(workspaceId);
  };

  beforeAll(async () => {
    workspaceId = await getSeededBillingWorkspaceId();
    clickHouseClient = createClickHouseClient({
      url: process.env.CLICKHOUSE_URL,
      clickhouse_settings: { allow_experimental_json_type: 1 },
      log: { level: ClickHouseLogLevel.OFF },
    });
  });

  beforeEach(async () => {
    await resetBillingCreditState(workspaceId);
    await setUpSubscription({});
  });

  afterEach(async () => {
    await clickHouseClient.command({
      query: `ALTER TABLE usageEvent DELETE WHERE workspaceId = {workspaceId:String} AND periodStart = {periodStart:DateTime64(3)}`,
      query_params: {
        workspaceId,
        periodStart: formatDateTimeForClickHouse(PERIOD_START),
      },
      clickhouse_settings: { mutations_sync: '2' },
    });
    await resetBillingCreditState(workspaceId);
    await setUpSubscription({});
  });

  afterAll(async () => {
    await quitBillingFixtureRedis();
    await clickHouseClient.close();
  });

  it('refuses once the period ledger reaches the plan allowance', async () => {
    await recordAiUsage(ALLOWANCE_MICRO);

    expect(await findAllowanceRefusal()).toMatchObject({
      exhaustedKind: 'allowance',
      limitValue: ALLOWANCE_MICRO,
    });
  });

  it('admits again once an admin grant covers the usage', async () => {
    await recordAiUsage(ALLOWANCE_MICRO);

    expect(await findAllowanceRefusal()).not.toBeNull();

    await grantCredits(1);

    expect(await findAllowanceRefusal()).toBeNull();
  });

  it('refuses again once that grant is revoked', async () => {
    await recordAiUsage(ALLOWANCE_MICRO);

    const creditGrantId = await grantCredits(1);

    expect(await findAllowanceRefusal()).toBeNull();

    const response = await callAdminGraphql(REVOKE_MUTATION, {
      workspaceId,
      creditGrantId,
    });

    expect(response.body.errors).toBeUndefined();
    expect(await findAllowanceRefusal()).toMatchObject({
      exhaustedKind: 'allowance',
      limitValue: ALLOWANCE_MICRO,
    });
  });

  it('caps a trialing subscription at the trial allowance', async () => {
    const twentyConfigService = getAppProviderByClassName<TwentyConfigService>(
      'TwentyConfigService',
    );
    const trialAllowanceMicro = Number(
      twentyConfigService.get(
        'BILLING_FREE_WORKFLOW_CREDITS_FOR_TRIAL_PERIOD_WITH_CREDIT_CARD',
      ),
    );

    await setUpSubscription({
      status: SubscriptionStatus.Trialing,
      trialStart: PERIOD_START,
      trialEnd: addDays(
        PERIOD_START,
        twentyConfigService.get(
          'BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS',
        ),
      ),
    });
    await recordAiUsage(trialAllowanceMicro);

    expect(await findAllowanceRefusal()).toMatchObject({
      exhaustedKind: 'allowance',
      limitValue: trialAllowanceMicro,
    });
  });

  it('admits when the plan has no resource-credit price to read an allowance from', async () => {
    await global.testDataSource.query(
      `DELETE FROM core."billingSubscriptionItem" WHERE "stripeSubscriptionItemId" = $1`,
      [TEST_STRIPE_SUBSCRIPTION_ITEM_ID],
    );
    await refreshCurrentBillingSubscription(workspaceId);
    await recordAiUsage(ALLOWANCE_MICRO);

    expect(await findAllowanceRefusal()).toBeNull();
  });

  it('keeps the allowance counter equal to the period ledger', async () => {
    const workflowRunCreditsMicro = [600, 300];

    for (const creditsUsedMicro of workflowRunCreditsMicro) {
      await getQuotaService().charge({
        workspaceId,
        events: [
          {
            resourceType: UsageResourceType.WORKFLOW,
            operationType: UsageOperationType.WORKFLOW_EXECUTION,
            unit: UsageUnit.INVOCATION,
            quantity: 1,
            creditsUsedMicro,
          },
        ],
      });
    }

    await expectEventually(
      async () => {
        expect(await readLedger()).toEqual({
          rowCount: workflowRunCreditsMicro.length,
          creditsUsedMicro: 900,
        });
      },
      { timeoutMs: CLICKHOUSE_FLUSH_TIMEOUT_MS, intervalMs: 250 },
    );

    expect(await readAllowanceConsumedMicro(workspaceId)).toBe(900);

    await flushQuotaCounters(workspaceId);

    expect(await readAllowanceConsumedMicro(workspaceId)).toBe(900);
  });

  it('keeps in-flight usage when a grant lifts the refusal', async () => {
    const grantMicro = INTERNAL_CREDITS_PER_DISPLAY_CREDIT;

    await recordAiUsage(ALLOWANCE_MICRO - IN_FLIGHT_CREDITS_MICRO);
    await debitInFlightCredits(workspaceId, IN_FLIGHT_CREDITS_MICRO);

    expect(await findAllowanceRefusal()).toMatchObject({
      exhaustedKind: 'allowance',
    });

    await grantCredits(1);

    expect(await findAllowanceRefusal(grantMicro)).toBeNull();
    expect(await findAllowanceRefusal(grantMicro + 1)).toMatchObject({
      exhaustedKind: 'allowance',
      limitValue: ALLOWANCE_MICRO + grantMicro,
    });
  });
});
