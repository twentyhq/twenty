import { EntityManager } from 'typeorm';

import { COMPANIES_DEMO } from 'src/engine/workspace-manager/demo-objects-prefill-data/companies-demo.json';

export const seedCompanyWithDemoData = async (
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
      COMPANIES_DEMO.map((company, index) => ({ ...company, position: index })),
    )
    .returning('*')
    .execute();
};
