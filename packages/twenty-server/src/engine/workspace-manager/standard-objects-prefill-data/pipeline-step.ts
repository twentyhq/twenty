import { EntityManager } from 'typeorm';

export const pipelineStepPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.pipelineStep`, ['name', 'color', 'position'])
    .orIgnore()
    .values([
      {
        name: 'NEW',
        color: 'red',
        position: 0,
      },
      {
        name: 'SCREENING',
        color: 'purple',
        position: 1,
      },
      {
        name: 'MEETING',
        color: 'sky',
        position: 2,
      },
      {
        name: 'PROPOSAL',
        color: 'turquoise',
        position: 3,
      },
      {
        name: 'CUSTOMER',
        color: 'yellow',
        position: 4,
      },
    ])
    .returning('*')
    .execute();
};
