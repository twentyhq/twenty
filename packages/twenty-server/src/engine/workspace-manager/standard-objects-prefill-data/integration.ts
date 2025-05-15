import { EntityManager } from 'typeorm';

export const STRIPE_ID = '6782bfdc-7854-4034-9b4b-33a80ef11822';
export const INTER_ID = '5fa41d56-4b72-4bb0-be79-5c8ef5c56125';

export const integrationPrefillData = async (
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
