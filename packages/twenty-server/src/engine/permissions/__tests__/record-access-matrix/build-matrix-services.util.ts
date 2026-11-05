import { type RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import {
  FLAT_OBJECT_METADATA,
  MATRIX_PRIVATE_RECORD_STATES,
  MATRIX_RECORD_SHARES,
} from 'src/engine/permissions/__tests__/record-access-matrix/record-access-matrix.world';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { RecordAccessDecisionService } from 'src/engine/permissions/internal/combine/services/record-access-decision.service';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const buildMatrixServices = (cacheValues: object) => {
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
      MATRIX_RECORD_SHARES.filter(({ recordId }) =>
        recordIds.includes(recordId),
      ),
    findPrivateRecordStates: async () => MATRIX_PRIVATE_RECORD_STATES,
    findRecordShareAccessLevelsByObjectMetadataId: async ({
      principalIds,
    }: {
      principalIds: string[];
    }) =>
      new Map([
        [
          FLAT_OBJECT_METADATA.id,
          MATRIX_RECORD_SHARES.filter(({ principalId }) =>
            principalIds.includes(principalId),
          ).map(({ accessLevel }) => accessLevel),
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
    recordPermissionReadOrmService,
    recordAccessDecisionService,
    recordPermissionsService: new RecordPermissionsService(
      recordAccessDecisionService,
    ),
  };
};
