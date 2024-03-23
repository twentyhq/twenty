import { EntityManager } from 'typeorm';

import companiesDemo from './companies-demo.json';

export const companyPrefillDemoData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.company`, [
      'name',
      'domainName',
      'address',
      'employees',
      'linkedinLinkUrl',
      'position',
    ])
    .orIgnore()
    .values(
      companiesDemo.map((company, index) => ({ ...company, position: index })),
    )
    .returning('*')
    .execute();
};
