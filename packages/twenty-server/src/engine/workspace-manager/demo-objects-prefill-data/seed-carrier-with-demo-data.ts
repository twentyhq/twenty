import { seedWorkspaceFavorites } from 'src/database/typeorm-seeds/workspace/favorites';
import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { shouldSeedWorkspaceFavorite } from 'src/engine/utils/should-seed-workspace-favorite';
import { CARRIERS_DEMO } from 'src/engine/workspace-manager/demo-objects-prefill-data/carriers-demo.json';
import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { carriersAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/carriers-all.view';

export const seedCarrierWithDemoData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap | undefined = undefined,
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

  if (objectMetadataStandardIdToIdMap) {
    // Create the carrier view
    const viewDefinitionsWithId = await createWorkspaceViews(
      entityManager,
      schemaName,
      [carriersAllView(objectMetadataStandardIdToIdMap)],
    );
    await seedWorkspaceFavorites(
      viewDefinitionsWithId
        .filter(
          (view) =>
            view.key === 'INDEX' &&
            shouldSeedWorkspaceFavorite(
              view.objectMetadataId,
              objectMetadataStandardIdToIdMap,
            ),
        )
        .map((view) => view.id),
      entityManager,
      schemaName,
    );
  }
};
