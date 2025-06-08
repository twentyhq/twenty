import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { CARRIERS_DEMO } from 'src/engine/workspace-manager/demo-objects-prefill-data/carriers-demo.json';

export const seedCarrierWithDemoData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.carrier`, [
      'name',
      'domainName',
      'location',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'position',
    ])
    .orIgnore()
    .values(
      CARRIERS_DEMO.map((carrier, index) => ({
        ...carrier,
        position: index,
      })),
    )
    .returning('*')
    .execute();
};
