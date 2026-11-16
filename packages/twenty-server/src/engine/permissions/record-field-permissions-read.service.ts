/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { buildFieldsUnreadableByEveryMatchingRuleSQLConditions } from 'src/engine/permissions/internal/field-access/utils/build-fields-unreadable-by-every-matching-rule-sql-conditions.util';
import { findRlsRuleInaccessibleFields } from 'src/engine/permissions/internal/field-access/utils/find-rls-rule-inaccessible-fields.util';
import { renderRlsRecordFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-rls-record-filter-to-sql.util';
import { buildRlsRulesRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type ObjectQuestion } from 'src/engine/permissions/types/record-permissions-question.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

@Injectable()
export class RecordFieldPermissionsReadService {
  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
  ) {}

  findUnreadableFields(question: ObjectQuestion): Promise<Set<string>> {
    return this.findObjectInaccessibleFieldMetadataIds({
      ...question,
      inaccessibleFieldsKey: 'unreadableFields',
    });
  }

  findUneditableFields(question: ObjectQuestion): Promise<Set<string>> {
    return this.findObjectInaccessibleFieldMetadataIds({
      ...question,
      inaccessibleFieldsKey: 'uneditableFields',
    });
  }

  async buildUnreadableFieldsSQLConditions({
    principals,
    objectMetadataId,
    tableAlias,
  }: ObjectQuestion & { tableAlias: string }): Promise<
    { fieldMetadataIds: string[]; sqlCondition: SQLCondition }[]
  > {
    if (!isDefined(principals)) {
      return [];
    }

    const rlsRuleInaccessibleFields = findRlsRuleInaccessibleFields({
      principals,
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals },
      ),
      objectMetadataId,
      inaccessibleFieldsKey: 'unreadableFields',
    });

    if (!isNonEmptyArray(rlsRuleInaccessibleFields)) {
      return [];
    }

    const { metadataMaps, flatObjectMetadata } =
      await this.findObjectMetadataOrThrow({ principals, objectMetadataId });

    const rlsRuleSQLConditions = rlsRuleInaccessibleFields.map(
      ({ rowLevelPermissionRule, fieldMetadataIds }) => ({
        fieldMetadataIds,
        sqlCondition: renderRlsRecordFilterToSql({
          recordFilter: buildRlsRulesRecordFilter({
            principals,
            metadataMaps,
            rowLevelPermissionRules: [rowLevelPermissionRule],
          }),
          tableAlias,
          objectMetadata: flatObjectMetadata,
          flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
          flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
        }) ?? { sql: 'TRUE', parameters: {} },
      }),
    );

    return buildFieldsUnreadableByEveryMatchingRuleSQLConditions(
      rlsRuleSQLConditions,
    );
  }

  private async findObjectInaccessibleFieldMetadataIds({
    principals,
    objectMetadataId,
    inaccessibleFieldsKey,
  }: ObjectQuestion & {
    inaccessibleFieldsKey: 'unreadableFields' | 'uneditableFields';
  }): Promise<Set<string>> {
    if (!isDefined(principals)) {
      return new Set();
    }

    const { flatObjectMetadata } = await this.findObjectMetadataOrThrow({
      principals,
      objectMetadataId,
    });
    const objectRecordsPermissions = (
      await this.permissionsMetadataMapsService.loadRecordsPermissionsForPrincipals(
        { principals },
      )
    ).objects[objectMetadataId];

    if (!isDefined(objectRecordsPermissions)) {
      return new Set(flatObjectMetadata.fieldIds);
    }

    return new Set(objectRecordsPermissions[inaccessibleFieldsKey]);
  }

  private async findObjectMetadataOrThrow({
    principals,
    objectMetadataId,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
  }): Promise<{
    metadataMaps: PermissionsMetadataMaps;
    flatObjectMetadata: FlatObjectMetadata;
  }> {
    const metadataMaps =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals,
      });
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return { metadataMaps, flatObjectMetadata };
  }
}
