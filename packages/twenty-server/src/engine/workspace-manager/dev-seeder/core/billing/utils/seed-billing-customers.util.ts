import { type DataSource } from 'typeorm';

const tableName = 'billingCustomer';

export const seedBillingCustomers = async (
  dataSource: DataSource,
  schemaName: string,
  workspaceId: string,
) => {
  await dataSource
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
