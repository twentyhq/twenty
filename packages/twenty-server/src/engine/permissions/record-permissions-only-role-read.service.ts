/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import {
  type ObjectOperationQuestion,
  type ObjectQuestion,
} from 'src/engine/permissions/types/record-permissions-question.type';

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

  findUnreadableFields(question: ObjectQuestion): Promise<Set<string>> {
    return this.findObjectFieldMetadataIds({
      ...question,
      fieldList: 'unreadableFields',
    });
  }

  findUneditableFields(question: ObjectQuestion): Promise<Set<string>> {
    return this.findObjectFieldMetadataIds({
      ...question,
      fieldList: 'uneditableFields',
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

  private async findObjectFieldMetadataIds({
    principals,
    objectMetadataId,
    fieldList,
  }: ObjectQuestion & {
    fieldList: 'unreadableFields' | 'uneditableFields';
  }): Promise<Set<string>> {
    if (!isDefined(principals)) {
      return new Set();
    }

    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals },
      ),
      objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const objectRecordsPermissions = (
      await this.permissionsMetadataMapsService.loadRecordsPermissionsForPrincipals(
        { principals },
      )
    ).objects[objectMetadataId];

    if (!isDefined(objectRecordsPermissions)) {
      return new Set(flatObjectMetadata.fieldIds);
    }

    return new Set(objectRecordsPermissions[fieldList]);
  }

  private findFlatObjectMetadata({
    metadataMaps,
    objectMetadataId,
  }: {
    metadataMaps: PermissionsMetadataMaps;
    objectMetadataId: string;
  }): FlatObjectMetadata | undefined {
    return findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });
  }
}
