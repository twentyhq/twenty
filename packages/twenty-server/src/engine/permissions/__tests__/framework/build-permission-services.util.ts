import { buildScenarioCacheValues } from 'src/engine/permissions/__tests__/framework/build-permission-cache-values.util';
import { buildPrincipals } from 'src/engine/permissions/__tests__/framework/build-principals.util';
import {
  OBJECT_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { type RecordAccessScenario } from 'src/engine/permissions/__tests__/framework/record-access-scenario.type';
import {
  buildStoredRecords,
  type StoredRecords,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { RecordAccessDecisionService } from 'src/engine/permissions/internal/combine/services/record-access-decision.service';
import { type RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { type PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const buildPermissionServices = ({
  cacheValues,
  storedRecords = buildStoredRecords([]),
  principals,
}: {
  cacheValues: object;
  storedRecords?: StoredRecords;
  principals?: PermissionsPrincipalsWithRolesContext;
}) => {
  const workspaceCacheService = {
    getOrRecompute: async () => cacheValues,
  } as unknown as WorkspaceCacheService;
  const principalPermissionsService = {
    buildPermissionsPrincipals: async () => principals,
  } as unknown as PrincipalPermissionsService;
  const permissionsMetadataMapsService = new PermissionsMetadataMapsService(
    workspaceCacheService,
  );
  const recordPermissionReadOrmService = {
    findRecordShares: async ({ recordIds }: { recordIds: string[] }) =>
      storedRecords.shares.filter(({ recordId }) =>
        recordIds.includes(recordId),
      ),
    findPrivateRecordStates: async () => storedRecords.privateRecordStates,
    findRecordShareAccessLevelsByObjectMetadataId: async ({
      principalIds,
    }: {
      principalIds: string[];
    }) =>
      new Map([
        [
          OBJECT_ID,
          storedRecords.shares
            .filter(({ principalId }) => principalIds.includes(principalId))
            .map(({ accessLevel }) => accessLevel),
        ],
      ]),
  } as unknown as RecordPermissionReadOrmService;
  const recordAccessDecisionService = new RecordAccessDecisionService(
    permissionsMetadataMapsService,
    recordPermissionReadOrmService,
    principalPermissionsService,
  );

  return {
    workspaceCacheService,
    principalPermissionsService,
    permissionsMetadataMapsService,
    recordAccessDecisionService,
    recordPermissionsService: new RecordPermissionsService(
      recordAccessDecisionService,
    ),
  };
};

export const buildScenarioServices = async ({
  scenario,
  storedRecords,
}: {
  scenario: RecordAccessScenario;
  storedRecords?: StoredRecords;
}) => {
  const { cacheValues, flatObjectMetadata } =
    buildScenarioCacheValues(scenario);
  const principals = buildPrincipals(scenario);
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
