import { type QueryRunner } from 'typeorm';

import { BillingEntitlementKey } from 'src/engine/core-modules/billing/enums/billing-entitlement-key.enum';

const tableName = 'billingEntitlement';

type SeedBillingEntitlementsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedBillingEntitlements = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedBillingEntitlementsArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'workspaceId',
      'key',
      'value',
      'stripeCustomerId',
    ])
    .orIgnore()
    .values([
      {
        workspaceId,
        key: BillingEntitlementKey.CUSTOM_ROLES,
        value: true,
        stripeCustomerId: 'cus_default0',
      },
    ])
    .execute();
};
