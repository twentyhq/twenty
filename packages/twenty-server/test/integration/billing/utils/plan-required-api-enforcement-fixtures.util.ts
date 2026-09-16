import { createClient, type RedisClientType } from 'redis';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';

export const PLAN_REQUIRED_ENFORCEMENT_CONFIG_KEY =
  'IS_PLAN_REQUIRED_API_ENFORCEMENT_ENABLED';

type BillingSubscriptionRow = Record<string, unknown>;

const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> =>
  global.testDataSource.query(sql, params);

let redisClient: RedisClientType | null = null;

const getRedisClient = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  redisClient = createClient({ url: process.env.REDIS_URL });
  await redisClient.connect();

  return redisClient;
};

export const flushBillingSubscriptionCache = async (
  workspaceId: string,
): Promise<void> => {
  const redis = await getRedisClient();
  const staleKeys = await redis.keys(
    `*currentBillingSubscription:${workspaceId}*`,
  );

  if (isNonEmptyArray(staleKeys)) {
    await redis.del(staleKeys);
  }
};

export const quitPlanRequiredFixtureRedis = async (): Promise<void> => {
  if (!redisClient) {
    return;
  }

  await redisClient.quit();
  redisClient = null;
};

/**
 * Snapshot + delete all billingSubscription rows for a workspace so the
 * workspace is unpaid (zero rows). Caller must restore via restoreBillingSubscriptions.
 */
export const removeBillingSubscriptionsForWorkspace = async (
  workspaceId: string,
): Promise<BillingSubscriptionRow[]> => {
  const rows = await query<BillingSubscriptionRow>(
    `SELECT * FROM core."billingSubscription" WHERE "workspaceId" = $1`,
    [workspaceId],
  );

  if (rows.length === 0) {
    return [];
  }

  await query(
    `DELETE FROM core."billingSubscriptionItem"
     WHERE "billingSubscriptionId" IN (
       SELECT id FROM core."billingSubscription" WHERE "workspaceId" = $1
     )`,
    [workspaceId],
  );

  await query(
    `DELETE FROM core."billingSubscription" WHERE "workspaceId" = $1`,
    [workspaceId],
  );

  await flushBillingSubscriptionCache(workspaceId);

  return rows;
};

export const restoreBillingSubscriptions = async (
  rows: BillingSubscriptionRow[],
): Promise<void> => {
  for (const row of rows) {
    const columns = Object.keys(row);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const quotedColumns = columns.map((column) => `"${column}"`).join(', ');
    const values = columns.map((column) => {
      const value = row[column];

      if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof Date)
      ) {
        return JSON.stringify(value);
      }

      return value;
    });

    await query(
      `INSERT INTO core."billingSubscription" (${quotedColumns})
       VALUES (${placeholders})
       ON CONFLICT (id) DO NOTHING`,
      values,
    );

    await flushBillingSubscriptionCache(String(row.workspaceId));
  }
};

export const setPlanRequiredApiEnforcementEnabled = async (
  enabled: boolean,
): Promise<void> => {
  const createResult = await createConfigVariable({
    input: {
      key: PLAN_REQUIRED_ENFORCEMENT_CONFIG_KEY,
      value: enabled,
    },
    expectToFail: true,
  });

  if (createResult.errors) {
    await updateConfigVariable({
      input: {
        key: PLAN_REQUIRED_ENFORCEMENT_CONFIG_KEY,
        value: enabled,
      },
    });
  }
};

export const clearPlanRequiredApiEnforcementOverride = async (): Promise<void> => {
  await deleteConfigVariable({
    input: { key: PLAN_REQUIRED_ENFORCEMENT_CONFIG_KEY },
    expectToFail: true,
  });
};

/** Insert a minimal subscription row when the Apple seed has none (orIgnore miss). */
export const ensureDisposableBillingSubscription = async (
  workspaceId: string,
): Promise<void> => {
  const existing = await query<{ id: string }>(
    `SELECT id FROM core."billingSubscription" WHERE "workspaceId" = $1 LIMIT 1`,
    [workspaceId],
  );

  if (existing.length > 0) {
    return;
  }

  const [customer] = await query<{ stripeCustomerId: string }>(
    `SELECT "stripeCustomerId" FROM core."billingCustomer" WHERE "workspaceId" = $1 LIMIT 1`,
    [workspaceId],
  );

  let stripeCustomerId = customer?.stripeCustomerId;

  if (!stripeCustomerId) {
    stripeCustomerId = 'cus_plan_required_gate_test';
    await query(
      `INSERT INTO core."billingCustomer" ("workspaceId", "stripeCustomerId")
       VALUES ($1, $2)`,
      [workspaceId, stripeCustomerId],
    );
  }

  await query(
    `INSERT INTO core."billingSubscription" (
       "workspaceId", "stripeCustomerId", "stripeSubscriptionId", status, metadata
     ) VALUES ($1, $2, $3, 'active', $4)`,
    [
      workspaceId,
      stripeCustomerId,
      'sub_plan_required_gate_test',
      JSON.stringify({ workspaceId }),
    ],
  );

  await flushBillingSubscriptionCache(workspaceId);
};

export const isBillingPlanRequiredGraphqlError = (
  // oxlint-disable-next-line typescript/no-explicit-any
  errors: any[] | undefined,
): boolean => {
  if (!errors?.length) {
    return false;
  }

  return errors.some(
    (error) =>
      error?.extensions?.subCode ===
        BillingExceptionCode.BILLING_PLAN_REQUIRED ||
      error?.extensions?.code === BillingExceptionCode.BILLING_PLAN_REQUIRED ||
      (error?.extensions?.code === 'FORBIDDEN' &&
        error?.extensions?.subCode ===
          BillingExceptionCode.BILLING_PLAN_REQUIRED),
  );
};
