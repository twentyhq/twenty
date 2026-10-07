import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { createClient, type RedisClientType } from 'redis';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { type UsageLimitQuotaService } from 'src/engine/core-modules/usage-limit/services/usage-limit-quota.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';
import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// The dev seeder creates no subscription item or period; rollover needs subscription -> item -> product -> price
export const TEST_STRIPE_CUSTOMER_ID = 'cus_default0';
export const TEST_STRIPE_SUBSCRIPTION_ID = 'sub_default0';

const TEST_STRIPE_PRODUCT_ID = 'prod_resource_credit_test';
const TEST_STRIPE_PRICE_ID = 'price_resource_credit_test';
export const TEST_STRIPE_SUBSCRIPTION_ITEM_ID = 'si_resource_credit_test';

export type CreditGrantRow = {
  id: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  effectiveAt: Date;
  expiresAt: Date | null;
  revokedAt: Date | null;
  reason: string | null;
  idempotencyKey: string | null;
  sourceGrantId: string | null;
};

const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> =>
  global.testDataSource.query(sql, params);

// Billing seeds insert with orIgnore, so which workspace holds them is not worth hardcoding
export const getSeededBillingWorkspaceId = async (): Promise<string> => {
  const [row] = await query<{ workspaceId: string }>(
    `SELECT "workspaceId" FROM core."billingSubscription" WHERE "stripeSubscriptionId" = $1`,
    [TEST_STRIPE_SUBSCRIPTION_ID],
  );

  if (!row) {
    throw new Error(
      `No seeded billing subscription ${TEST_STRIPE_SUBSCRIPTION_ID}: the dev seeder did not run`,
    );
  }

  return row.workspaceId;
};

export const setupResourceCreditSubscription = async ({
  workspaceId,
  periodStart,
  periodEnd,
  creditAmountMicro,
  status = 'active',
  trialStart = null,
  trialEnd = null,
}: {
  workspaceId: string;
  periodStart: Date;
  periodEnd: Date;
  creditAmountMicro: number;
  status?: string;
  trialStart?: Date | null;
  trialEnd?: Date | null;
}): Promise<{ subscriptionId: string }> => {
  await query(
    `UPDATE core."billingSubscription"
     SET "currentPeriodStart" = $2, "currentPeriodEnd" = $3, status = $4,
         "trialStart" = $5, "trialEnd" = $6, interval = 'month'
     WHERE "workspaceId" = $1 AND "stripeSubscriptionId" = $7`,
    [
      workspaceId,
      periodStart,
      periodEnd,
      status,
      trialStart,
      trialEnd,
      TEST_STRIPE_SUBSCRIPTION_ID,
    ],
  );

  const [subscription] = await query<{ id: string }>(
    `SELECT id FROM core."billingSubscription"
     WHERE "workspaceId" = $1 AND "stripeSubscriptionId" = $2`,
    [workspaceId, TEST_STRIPE_SUBSCRIPTION_ID],
  );

  await query(
    `INSERT INTO core."billingProduct"
       ("stripeProductId", active, name, description, metadata)
     VALUES ($1, true, 'Test resource credit', '', $2)
     ON CONFLICT ("stripeProductId") DO UPDATE SET metadata = EXCLUDED.metadata`,
    [TEST_STRIPE_PRODUCT_ID, JSON.stringify({ productKey: 'RESOURCE_CREDIT' })],
  );

  await query(
    `INSERT INTO core."billingPrice"
       ("stripePriceId", "stripeProductId", active, currency, "taxBehavior",
        type, "billingScheme", "usageType", interval, "unitAmount", metadata)
     VALUES ($1, $2, true, 'usd', 'UNSPECIFIED', 'RECURRING', 'PER_UNIT',
             'LICENSED', 'month', 1000, $3)
     ON CONFLICT ("stripePriceId") DO UPDATE SET metadata = EXCLUDED.metadata`,
    [
      TEST_STRIPE_PRICE_ID,
      TEST_STRIPE_PRODUCT_ID,
      JSON.stringify({ credit_amount: String(creditAmountMicro) }),
    ],
  );

  await query(
    `INSERT INTO core."billingSubscriptionItem"
       ("billingSubscriptionId", "stripeSubscriptionId", "stripeProductId",
        "stripePriceId", "stripeSubscriptionItemId", quantity)
     VALUES ($1, $2, $3, $4, $5, 1)
     ON CONFLICT ("stripeSubscriptionItemId") DO UPDATE
       SET "stripePriceId" = EXCLUDED."stripePriceId",
           "stripeProductId" = EXCLUDED."stripeProductId"`,
    [
      subscription.id,
      TEST_STRIPE_SUBSCRIPTION_ID,
      TEST_STRIPE_PRODUCT_ID,
      TEST_STRIPE_PRICE_ID,
      TEST_STRIPE_SUBSCRIPTION_ITEM_ID,
    ],
  );

  return { subscriptionId: subscription.id };
};

export const insertCreditGrant = async ({
  workspaceId,
  amountMicro,
  type,
  effectiveAt,
  expiresAt,
  idempotencyKey = null,
}: {
  workspaceId: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  effectiveAt: Date;
  expiresAt: Date | null;
  idempotencyKey?: string | null;
}): Promise<string> => {
  const [row] = await query<{ id: string }>(
    `INSERT INTO core."billingCreditGrant"
       ("workspaceId", "amountMicro", type, "effectiveAt", "expiresAt", "idempotencyKey")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [workspaceId, amountMicro, type, effectiveAt, expiresAt, idempotencyKey],
  );

  return row.id;
};

export const listCreditGrants = async (
  workspaceId: string,
): Promise<CreditGrantRow[]> =>
  query<CreditGrantRow>(
    `SELECT id, "amountMicro"::bigint::int AS "amountMicro", type, "effectiveAt",
            "expiresAt", "revokedAt", reason, "idempotencyKey", "sourceGrantId"
     FROM core."billingCreditGrant"
     WHERE "workspaceId" = $1
     ORDER BY "createdAt" ASC`,
    [workspaceId],
  );

let redisClient: RedisClientType | null = null;

const getRedisClient = async (): Promise<RedisClientType> => {
  if (!isDefined(redisClient)) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }

  return redisClient;
};

export const quitBillingFixtureRedis = async (): Promise<void> => {
  if (isDefined(redisClient)) {
    await redisClient.quit();
    redisClient = null;
  }
};

const getUsageLimitQuotaService = () =>
  getAppProviderByClassName<UsageLimitQuotaService>('UsageLimitQuotaService');

export const refreshCurrentBillingSubscription = (
  workspaceId: string,
): Promise<void> =>
  getAppProviderByClassName<WorkspaceCacheService>(
    'WorkspaceCacheService',
  ).invalidateAndRecompute(workspaceId, ['currentBillingSubscription']);

export const flushQuotaCounters = async (
  workspaceId: string,
): Promise<void> => {
  const redis = await getRedisClient();
  const counterKeys = await redis.keys(`*{${workspaceId}}:quota*`);

  if (isNonEmptyArray(counterKeys)) {
    await redis.del(counterKeys);
  }
};

export const debitInFlightCredits = async (
  workspaceId: string,
  creditsUsedMicro: number,
): Promise<void> => {
  await getUsageLimitQuotaService().debitAheadOfRecord({
    workspaceId,
    event: {
      resourceType: UsageResourceType.AI,
      operationType: UsageOperationType.AI_CHAT_TOKEN,
      unit: UsageUnit.TOKEN,
      quantity: 1,
      creditsUsedMicro,
      spenders: {},
    },
  });
};

export const readAllowanceConsumedMicro = async (
  workspaceId: string,
): Promise<number> => {
  const allowanceUsage =
    await getUsageLimitQuotaService().getAllowanceUsage(workspaceId);

  if (!isDefined(allowanceUsage?.consumedValue)) {
    throw new Error(`No allowance consumption for workspace ${workspaceId}`);
  }

  return allowanceUsage.consumedValue;
};

export const resetBillingCreditState = async (
  workspaceId: string,
): Promise<void> => {
  await query(
    `DELETE FROM core."billingCreditGrant" WHERE "workspaceId" = $1`,
    [workspaceId],
  );

  await flushQuotaCounters(workspaceId);

  const redis = await getRedisClient();
  const staleKeys = await redis.keys(
    `*currentBillingSubscription:${workspaceId}*`,
  );

  if (isNonEmptyArray(staleKeys)) {
    await redis.del(staleKeys);
  }
};

// Cancelling stops getCurrentBillingSubscription returning it without deleting rows the suite shares
export const setSubscriptionStatus = async (
  workspaceId: string,
  status: SubscriptionStatus,
): Promise<void> => {
  await query(
    `UPDATE "core"."billingSubscription" SET status = $2 WHERE "workspaceId" = $1`,
    [workspaceId, status],
  );
};
