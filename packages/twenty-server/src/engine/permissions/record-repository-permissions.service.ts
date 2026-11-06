/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  type ObjectRecord,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import {
  type PermissionsMetadataMaps,
  type RowAccessEvaluationContext,
  type RowAccessRecord,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildPermissionsCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-condition.util';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { type RecordShareGrant } from 'src/engine/permissions/internal/record-share/types/record-share-grant.type';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-orm/utils/build-record-share-table-expression.util';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/internal/role/utils/validate-operation-is-permitted-or-throw.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-record-filter.util';
import { validateRLSPredicatesForRecords } from 'src/engine/permissions/internal/rls/utils/validate-rls-predicates-for-records.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

type RecordOperationQuestion = {
  principals: PermissionsPrincipalsWithRolesContext;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: ObjectRecordsOperationType;
};

@Injectable()
export class RecordRepositoryPermissionsService {
  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
  ) {}

  async findRecordReadRestrictions({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<RecordReadRestrictions> {
    return buildRecordReadRestrictions({
      recordsPermissions:
        await this.permissionsMetadataMapsService.loadRecordsPermissionsForPrincipals(
          { principals },
        ),
    });
  }

  async isOperationDisabled(
    question: RecordOperationQuestion,
  ): Promise<boolean> {
    return isObjectOperationDisabledToPrincipals({
      ...question,
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals: question.principals },
      ),
    });
  }

  async assertObjectOperationAccessibleOrThrow(
    question: RecordOperationQuestion,
  ): Promise<void> {
    const metadataMaps =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals: question.principals,
      });

    if (
      !isObjectOperationDisabledToPrincipals({ ...question, metadataMaps }) &&
      isObjectOperationDeniedToPrincipals({ ...question, metadataMaps })
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }
  }

  async assertColumnsReadableAndUpdatableOrThrow({
    principals,
    flatObjectMetadata,
    operationType,
    selectedColumns,
    updatedColumns,
  }: RecordOperationQuestion & {
    selectedColumns: string[];
    updatedColumns: string[];
  }): Promise<void> {
    const metadataMaps =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals,
      });

    validateOperationIsPermittedOrThrow({
      entityName: flatObjectMetadata.nameSingular,
      operationType,
      recordsPermissions:
        await this.permissionsMetadataMapsService.loadRecordsPermissionsForPrincipals(
          { principals },
        ),
      flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      objectIdByNameSingular: {
        [flatObjectMetadata.nameSingular]: flatObjectMetadata.id,
      },
      selectedColumns,
      updatedColumns,
    });
  }

  async buildRecordsAccessCondition({
    principals,
    flatObjectMetadata,
    operationType,
    tableAlias,
  }: RecordOperationQuestion & {
    tableAlias: string;
  }): Promise<SqlCondition | boolean> {
    return buildPermissionsCondition({
      principals,
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals },
      ),
      flatObjectMetadata,
      operationType,
      tableAlias,
      recordShareTableExpression: buildRecordShareTableExpression({
        workspaceId: principals.workspaceId,
      }),
    });
  }

  async assertCreatedRecordsMatchRowLevelPermissionsOrThrow({
    principals,
    flatObjectMetadata,
    records,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    flatObjectMetadata: FlatObjectMetadata;
    records: ObjectRecord[];
  }): Promise<void> {
    validateRLSPredicatesForRecords({
      records,
      objectMetadata: flatObjectMetadata,
      principals,
      metadataMaps: await this.permissionsMetadataMapsService.loadForPrincipals(
        { principals },
      ),
    });
  }

  async assertUpdatesKeepRecordAccessOrThrow({
    principals,
    flatObjectMetadata,
    updates,
    formatRecords,
    transactionScope,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    flatObjectMetadata: FlatObjectMetadata;
    updates: {
      rawRecordBefore: ObjectRecord;
      setColumns: Record<string, unknown>;
    }[];
    formatRecords: (rawRecords: ObjectRecord[]) => ObjectRecord[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const metadataMaps =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals,
      });

    if (
      !isDefined(
        resolveRowLevelPermissionRecordFilter({
          principals,
          metadataMaps,
          flatObjectMetadata,
        }),
      )
    ) {
      return;
    }

    const context = this.buildWriteRowAccessEvaluationContext({
      workspaceId: principals.workspaceId,
      flatObjectMetadata,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      recordIds: updates.map(({ rawRecordBefore }) =>
        String(rawRecordBefore.id),
      ),
      transactionScope,
    });
    const evaluate = (rawRecords: ObjectRecord[]) =>
      findGrantedRecordIds({
        principals,
        metadataMaps,
        flatObjectMetadata,
        operationType: 'update',
        records: formatRecords(rawRecords).filter(
          (record): record is RowAccessRecord => isNonEmptyString(record.id),
        ),
        context,
      });

    const updatableRecordIdsBefore = await evaluate(
      updates.map(({ rawRecordBefore }) => rawRecordBefore),
    );
    const updatableRecordIdsAfter = await evaluate(
      updates
        .filter(({ rawRecordBefore }) =>
          updatableRecordIdsBefore.has(String(rawRecordBefore.id)),
        )
        .map(({ rawRecordBefore, setColumns }) => ({
          ...rawRecordBefore,
          ...setColumns,
        })),
    );

    if (
      [...updatableRecordIdsBefore].some(
        (id) => !updatableRecordIdsAfter.has(id),
      )
    ) {
      throw new PermissionsException(
        'Updated record does not satisfy row-level security constraints of your current role',
        PermissionsExceptionCode.RLS_VALIDATION_FAILED,
      );
    }
  }

  private buildWriteRowAccessEvaluationContext({
    workspaceId,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    recordIds,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: PermissionsMetadataMaps['flatFieldMetadataMaps'];
    recordIds: string[];
    transactionScope: RecordPermissionTransactionScope;
  }): RowAccessEvaluationContext {
    const recordShareGrantsByObjectMetadataId = new Map<
      string,
      Promise<RecordShareGrant[]>
    >();
    let privateRecordStates:
      | Promise<Map<string, PrivateRecordState>>
      | undefined;

    return {
      shouldIgnoreSoftDeleteDefaultFilter: false,
      fetchRecordShares: async ({
        objectMetadataId,
        recordIds: requestedRecordIds,
      }) => {
        const recordShareGrants =
          recordShareGrantsByObjectMetadataId.get(objectMetadataId) ??
          this.recordPermissionReadOrmService.findRecordShares({
            workspaceId,
            objectMetadataId,
            recordIds,
            transactionScope,
          });

        recordShareGrantsByObjectMetadataId.set(
          objectMetadataId,
          recordShareGrants,
        );

        const requestedRecordIdSet = new Set(requestedRecordIds);

        return (await recordShareGrants).filter((recordShareGrant) =>
          requestedRecordIdSet.has(recordShareGrant.recordId),
        );
      },
      findPrivateRecordStates: async () =>
        (privateRecordStates ??=
          this.recordPermissionReadOrmService.findPrivateRecordStates({
            workspaceId,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            recordIds,
            transactionScope,
          })),
    };
  }
}
