import { type BillingCreditGrantType } from 'src/engine/core-modules/billing/enums/billing-credit-grant-type.enum';
import { type BillingUsageCacheService } from 'src/engine/core-modules/billing/services/billing-usage-cache.service';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

export const TEST_STRIPE_CUSTOMER_ID = 'cus_default0';
export const TEST_STRIPE_SUBSCRIPTION_ID = 'sub_default0';

const TEST_STRIPE_PRODUCT_ID = 'prod_resource_credit_test';
const TEST_STRIPE_PRICE_ID = 'price_resource_credit_test';
const TEST_STRIPE_SUBSCRIPTION_ITEM_ID = 'si_resource_credit_test';

export type CreditGrantRow = {
  id: string;
  amountMicro: number;
  type: BillingCreditGrantType;
  effectiveAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  reason: string | null;
  idempotencyKey: string | null;
  sourceGrantId: string | null;
};

const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> =>
  global.testDataSource.query(sql, params);

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
  expiresAt: Date;
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

export const getMirroredCreditBalance = async (
  workspaceId: string,
): Promise<number> => {
  const [row] = await query<{ creditBalanceMicro: string }>(
    `SELECT "creditBalanceMicro" FROM core."billingCustomer" WHERE "workspaceId" = $1`,
    [workspaceId],
  );

  return Number(row?.creditBalanceMicro ?? 0);
};

export const resetBillingCreditState = async (
  workspaceId: string,
): Promise<void> => {
  await query(
    `DELETE FROM core."billingCreditGrant" WHERE "workspaceId" = $1`,
    [workspaceId],
  );
  await query(
    `UPDATE core."billingCustomer" SET "creditBalanceMicro" = 0 WHERE "workspaceId" = $1`,
    [workspaceId],
  );
  const cache = getBillingUsageCacheService();

  await cache.flushAvailableCredits(workspaceId);
  await cache.flushCounterAdjustmentMarkers(workspaceId);
};

export const getBillingUsageCacheService = (): BillingUsageCacheService =>
  getAppProviderByClassName<BillingUsageCacheService>(
    'BillingUsageCacheService',
  );
