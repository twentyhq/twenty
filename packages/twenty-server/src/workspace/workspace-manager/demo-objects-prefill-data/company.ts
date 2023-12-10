import { EntityManager } from 'typeorm';

import { companiesDemo } from './companies-demo';

export const companyPrefillData = async (
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
    ])
    .orIgnore()
    .values(companiesDemo)
    .returning('*')
    .execute();
};
