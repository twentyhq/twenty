import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { CARRIERS_DEMO } from 'src/engine/workspace-manager/demo-objects-prefill-data/carriers-demo.json';

export const seedCarrierWithDemoData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const existingCarriers = await entityManager.createQueryBuilder(undefined, undefined, undefined, {
    shouldBypassPermissionChecks: true,
  })
    .from(`${schemaName}.carrier`, 'c')
    .execute();

  if (existingCarriers.length > 0) {
    console.log(`Skipping: ${existingCarriers.length} carriers already exist`);
    return;
  }

  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.carrier`, [
      'name',
      'domainNamePrimaryLinkUrl',
      'location',
      'position',
    ])
    .values(
      CARRIERS_DEMO.map((carrier, index) => ({
        name: carrier.name,
        domainNamePrimaryLinkUrl: `https://${carrier.domainName}`,
        location: carrier.location,
        position: index,
      })),
    )
    .orIgnore()
    .returning('*')
    .execute();
};
