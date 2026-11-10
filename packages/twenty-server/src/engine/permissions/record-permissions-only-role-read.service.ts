/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { type ObjectOperationQuestion } from 'src/engine/permissions/types/record-permissions-question.type';

@Injectable()
export class RecordPermissionsOnlyRoleReadService {
  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
  ) {}

  async canRoleAccessSomeRecords({
    principals,
    objectMetadataId,
    operationType,
  }: ObjectOperationQuestion): Promise<boolean> {
    if (!isDefined(principals)) {
      return false;
    }

    const { objects } =
      await this.permissionsMetadataMapsService.loadRecordsPermissionsForPrincipals(
        { principals },
      );

    const { featureFlagsMap } =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals,
      });

    return canReachSomeRecords({
      objectRecordsPermissions: objects[objectMetadataId],
      operationType: getEnforcedOperationType({
        operationType,
        featureFlagsMap,
      }),
    });
  }

  async filterRoleIdsWithoutReadAccess({
    workspaceId,
    roleIds,
    objectMetadataId,
  }: {
    workspaceId: string;
    roleIds: string[];
    objectMetadataId: string;
  }): Promise<Set<string>> {
    const metadataMaps = await this.permissionsMetadataMapsService.load({
      workspaceId,
    });

    return new Set(
      roleIds.filter(
        (roleId) =>
          !canReachSomeRecords({
            objectRecordsPermissions:
              getPermissionsPrincipalsRecordsPermissions({
                principals: buildRolePermissionsPrincipals({
                  workspaceId,
                  roleId,
                }),
                metadataMaps,
              }).objects[objectMetadataId],
            operationType: 'read',
          }),
      ),
    );
  }
}
