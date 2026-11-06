import { buildWorldCacheValues } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { buildPermissionServices } from 'src/engine/permissions/__tests__/framework/build-permission-services.util';
import { buildPrincipals } from 'src/engine/permissions/__tests__/framework/build-principals.util';
import { type RecordAccessWorld } from 'src/engine/permissions/__tests__/framework/given-principals.util';
import { WORKSPACE_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type StoredRecords } from 'src/engine/permissions/__tests__/framework/stored-records.util';

export const resolveWorld = async ({
  world,
  storedRecords,
}: {
  world: RecordAccessWorld;
  storedRecords?: StoredRecords;
}) => {
  const { cacheValues, flatObjectMetadata } = buildWorldCacheValues(world);
  const principals = buildPrincipals(world);
  const services = buildPermissionServices({
    cacheValues,
    storedRecords,
    principals,
  });

  return {
    services,
    principals,
    flatObjectMetadata,
    metadataMaps: await services.permissionsMetadataMapsService.load({
      workspaceId: WORKSPACE_ID,
    }),
  };
};
