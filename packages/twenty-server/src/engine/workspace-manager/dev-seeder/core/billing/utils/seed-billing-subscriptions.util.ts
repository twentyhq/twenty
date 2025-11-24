import { type QueryRunner } from 'typeorm';

const tableName = 'billingSubscription';

type SeedBillingSubscriptionsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedBillingSubscriptions = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedBillingSubscriptionsArgs) => {
  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'workspaceId',
      'stripeCustomerId',
      'stripeSubscriptionId',
      'status',
      'metadata',
    ])
    .orIgnore()
    .values([
      {
        workspaceId,
        stripeCustomerId: 'cus_default0',
        stripeSubscriptionId: 'sub_default0',
        status: 'active',
        metadata: {
          workspaceId,
        },
      },
    ])
    .execute();
};
