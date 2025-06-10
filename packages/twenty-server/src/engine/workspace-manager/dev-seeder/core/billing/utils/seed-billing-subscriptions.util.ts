import { DataSource } from 'typeorm';

const tableName = 'billingSubscription';

export const seedBillingSubscriptions = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
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
