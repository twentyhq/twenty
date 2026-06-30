import { type QueryRunner } from 'typeorm';

const tableName = 'billingCustomer';

type SeedBillingCustomersArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedBillingCustomers = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedBillingCustomersArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, ['workspaceId', 'stripeCustomerId'])
    .orIgnore()
    .values([
      {
        workspaceId,
        stripeCustomerId: 'cus_default0',
      },
    ])
    .execute();
};
