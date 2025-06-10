
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { COMPANIES_DEMO } from 'src/engine/workspace-manager/demo-objects-prefill-data/companies-demo.json';

export const seedCompanyWithDemoData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
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
