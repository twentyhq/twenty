import { EntityManager } from 'typeorm';

export const opportunityPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.opportunity`, [
      'amount',
      'closeDate',
      'probability',
      'pipelineStepId',
      'pointOfContactId',
      'personId',
      'companyId',
    ])
    .orIgnore()
    .values([
      {
        amount: 100000,
        closeDate: new Date(),
        probability: 0.5,
        pipelineStepId: '73ac09c6-2b90-4874-9e5d-553ea76912ee',
        pointOfContactId: 'bb757987-ae38-4d16-96ec-b25b595e7bd8',
        personId: 'a4a2b8e9-7a2b-4b6a-8c8b-7e9a0a0a0a0a',
        companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      },
    ])
    .returning('*')
    .execute();
};
