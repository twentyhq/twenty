/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRlsRuleFieldsByRole } from 'src/engine/permissions/internal/masking/utils/find-rls-rule-fields-by-role.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type ObjectQuestion } from 'src/engine/permissions/types/record-permissions-question.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

@Injectable()
export class RecordPermissionsOnlyRLSReadService {
  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
  ) {}

  async findRlsRuleUnreadableFieldsByRole({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<
    { roleId: string; fieldMetadataIds: string[] }[]
  > {
    if (!isDefined(principals)) {
      return [];
    }

    return findRlsRuleFieldsByRole({
      principals,
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals },
      ),
      objectMetadataId,
      fieldList: 'unreadableFields',
    });
  }

  async buildRlsRuleSqlConditionOrThrow({
    principals,
    objectMetadataId,
    roleId,
    tableAlias,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    roleId: string;
    tableAlias: string;
  }): Promise<SqlCondition> {
    const metadataMaps =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals,
      });
    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps,
      objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    // An RLS rule whose filter compiles to nothing matches every record
    return (
      renderRowLevelPermissionFilterToSql({
        recordFilter:
          resolveRlsRuleRecordFilter({
            principals,
            metadataMaps,
            flatObjectMetadata,
            roleId,
          }) ?? {},
        tableAlias,
        objectMetadata: flatObjectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
      }) ?? { sql: 'TRUE', parameters: {} }
    );
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
