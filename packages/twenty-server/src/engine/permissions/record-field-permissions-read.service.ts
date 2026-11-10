/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getColumnNameToFieldMetadataIdMap } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-column-name-to-field-metadata-id.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { composeRecordFieldMetadataIds } from 'src/engine/permissions/internal/field-access/utils/compose-record-field-metadata-ids.util';
import { findFieldsHiddenOnMatchingRecordsByRole } from 'src/engine/permissions/internal/field-access/utils/find-rls-rule-fields-by-role.util';
import { resolveFieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/utils/resolve-fields-hidden-on-matching-records.util';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { type ObjectQuestion } from 'src/engine/permissions/types/record-permissions-question.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

@Injectable()
export class RecordFieldPermissionsReadService {
  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
  ) {}

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

  async findRlsRuleUnreadableFieldsByRole({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<
    { roleId: string; fieldMetadataIds: string[] }[]
  > {
    if (!isDefined(principals)) {
      return [];
    }

    return findFieldsHiddenOnMatchingRecordsByRole({
      principals,
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals },
      ),
      objectMetadataId,
      fieldList: 'unreadableFields',
    });
  }

  async buildRlsRuleSQLConditionOrThrow({
    principals,
    objectMetadataId,
    roleId,
    tableAlias,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    roleId: string;
    tableAlias: string;
  }): Promise<SQLCondition> {
    const { metadataMaps, flatObjectMetadata } =
      await this.findObjectMetadataOrThrow({ principals, objectMetadataId });

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

  async assertUpdatedColumnsAreEditableOrThrow({
    principals,
    objectMetadataId,
    updates,
    formatRecords,
    transactionScope,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    updates: {
      rawRecordBefore: ObjectRecord;
      setColumns: Record<string, unknown>;
    }[];
    formatRecords: (rawRecords: ObjectRecord[]) => ObjectRecord[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const { metadataMaps, flatObjectMetadata } =
      await this.findObjectMetadataOrThrow({ principals, objectMetadataId });

    const fieldsHiddenOnMatchingRecords =
      await resolveFieldsHiddenOnMatchingRecords({
        principals,
        metadataMaps,
        flatObjectMetadata,
        fieldList: 'uneditableFields',
        records: formatRecords(
          updates.map(({ rawRecordBefore }) => rawRecordBefore),
        ),
        findRelationJoinValues: (args) =>
          this.recordPermissionReadRepository.findRelationJoinValues({
            ...args,
            workspaceId: principals.workspaceId,
            transactionScope,
          }),
      });

    if (fieldsHiddenOnMatchingRecords.length === 0) {
      return;
    }

    const columnNameToFieldMetadataId = getColumnNameToFieldMetadataIdMap(
      flatObjectMetadata,
      metadataMaps.flatFieldMetadataMaps,
    );

    for (const { rawRecordBefore, setColumns } of updates) {
      const uneditableFieldMetadataIds = composeRecordFieldMetadataIds({
        flatObjectMetadata,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        objectFieldMetadataIds: [],
        records: formatRecords([rawRecordBefore]),
        fieldsHiddenOnMatchingRecords,
      });

      if (
        Object.keys(setColumns).some((columnName) =>
          uneditableFieldMetadataIds.has(
            columnNameToFieldMetadataId[columnName],
          ),
        )
      ) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
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

    return new Set(objectRecordsPermissions[fieldList]);
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
