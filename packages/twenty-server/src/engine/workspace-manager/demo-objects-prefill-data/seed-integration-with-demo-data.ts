import { EntityManager } from 'typeorm';

export const STRIPE_ID = '36d583ac-fdda-40eb-8f31-6754cde43e80';
export const INTER_ID = '415f0acb-8f25-40b6-9b7a-c393b719c0f8';

export const seedIntegrationWithDemoData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.integration`, ['id', 'name', 'position'])
    .orIgnore()
    .values([
      { id: STRIPE_ID, name: 'Stripe', position: 1 },
      { id: INTER_ID, name: 'Inter', position: 2 },
    ])
    .returning('*')
    .execute();
};
