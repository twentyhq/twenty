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
        name: 'جدید',
        color: 'red',
        position: 0,
      },
      {
        name: 'غربالگری',
        color: 'purple',
        position: 1,
      },
      {
        name: 'جلسه',
        color: 'sky',
        position: 2,
      },
      {
        name: 'پیشنهاد',
        color: 'turquoise',
        position: 3,
      },
      {
        name: 'مشتری',
        color: 'yellow',
        position: 4,
      },
    ])
    .returning('*')
    .execute();
};
