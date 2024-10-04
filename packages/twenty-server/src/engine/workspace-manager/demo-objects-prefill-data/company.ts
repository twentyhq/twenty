import { EntityManager } from 'typeorm';

import { companiesDemo } from 'src/engine/workspace-manager/demo-objects-prefill-data/companies-demo.json';

export const companyPrefillDemoData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.company`, [
      'name',
      'domainNamePrimaryLinkUrl',
      'addressAddressCity',
      'employees',
      'linkedinLinkPrimaryLinkUrl',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'position'
    ])
    .orIgnore()
    .values(
      companiesDemo.map((company, index) => ({ ...company, position: index })),
    )
    .returning('*')
    .execute();
};
