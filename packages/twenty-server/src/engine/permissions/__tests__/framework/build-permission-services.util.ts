import { OBJECT_ID } from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  buildStoredRecords,
  type StoredRecords,
} from 'src/engine/permissions/__tests__/framework/stored-records.util';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { RecordAccessDecisionService } from 'src/engine/permissions/internal/combine/services/record-access-decision.service';
import { type RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const buildPermissionServices = ({
  cacheValues,
  storedRecords = buildStoredRecords([]),
}: {
  cacheValues: object;
  storedRecords?: StoredRecords;
}) => {
  const workspaceCacheService = {
    getOrRecompute: async () => cacheValues,
  } as unknown as WorkspaceCacheService;
  const principalPermissionsService = new PrincipalPermissionsService(
    workspaceCacheService,
  );
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
