import { EntityManager } from 'typeorm';

export const workflowPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.workflow`, ['name', 'publishedVersionId', 'position'])
    .orIgnore()
    .values([
      {
        name: 'Update Subscription Status',
        publishedVersionId: null,
        position: 1,
      },
    ])
    .returning('*')
    .execute();
};
