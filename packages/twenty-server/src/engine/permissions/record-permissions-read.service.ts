/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  FeatureFlagKey,
  type ObjectRecordsOperationType,
  type RecordShareAccessLevel,
  type ObjectRecord,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { assertUpdatedColumnsAreEditableOrThrow } from 'src/engine/permissions/internal/field-access/utils/assert-updated-columns-are-editable-or-throw.util';
import { isMainRoleRestrictedByRlsRule } from 'src/engine/permissions/internal/rls/utils/is-main-role-restricted-by-rls-rule.util';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/internal/role/utils/validate-operation-is-permitted-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { AccessGroupReadService } from 'src/engine/permissions/internal/access-group/services/access-group-read.service';
import { resolveRecordsAccessSQLConditionStrategy } from 'src/engine/permissions/internal/access-group/utils/resolve-records-access-sql-condition-strategy.util';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/internal/private-record/utils/is-record-privacy-applicable.util';
import { PrivateRecordRepository } from 'src/engine/permissions/internal/private-record/repositories/private-record.repository';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-share-table-expression.util';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
  type RowAccessEvaluationContext,
  type RowAccessRecord,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import {
  type ObjectOperationQuestion,
  type ObjectQuestion,
} from 'src/engine/permissions/types/record-permissions-question.type';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/internal/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/combine/utils/is-object-operation-denied-to-principals.util';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';
import { canRelatedRecordPathsReachObject } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-paths-reach-object.util';
import { areRecordIdsReadableByPrincipals } from 'src/engine/permissions/internal/role/utils/are-record-ids-readable-by-principals.util';
import { canRelatedRecordPathGrantOperation } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-grant-operation.util';
import { buildRecordShareOrCreatorSQLCondition } from 'src/engine/permissions/internal/combine/utils/build-record-share-or-creator-sql-condition.util';
import { combineSQLConditionOutcomesWithOr } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-condition-outcomes-with-or.util';
import {
  type BuildEntrySQLCondition,
  buildRelatedRecordPathsSQLCondition,
} from 'src/engine/permissions/internal/related-record-path/utils/build-related-record-paths-sql-condition.util';
import { buildPermissionsSQLCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-sql-condition.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';
import { isNonEmptyString } from '@sniptt/guards';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { type RecordShareGrant } from 'src/engine/permissions/internal/record-share/types/record-share-grant.type';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { validateRLSPredicatesForRecords } from 'src/engine/permissions/internal/rls/utils/validate-rls-predicates-for-records.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

type RecordOperationQuestion = {
  principals: PermissionsPrincipalsWithRolesContext;
  objectMetadataId: string;
  operationType: ObjectRecordsOperationType;
};

type RecordsQuestion = ObjectQuestion & {
  recordIds: string[];
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  transactionScope?: RecordPermissionTransactionScope;
};

type RecordsOperationQuestion = RecordsQuestion & ObjectOperationQuestion;

@Injectable()
export class RecordPermissionsReadService {
  private readonly sharedAccessLevelsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<Map<string, RecordShareAccessLevel[]>>
  >();

  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
    private readonly privateRecordRepository: PrivateRecordRepository,
    private readonly principalPermissionsReadService: PrincipalPermissionsReadService,
    private readonly accessGroupReadService: AccessGroupReadService,
  ) {}

  async findRecordsActions({
    authContext,
    objectNameSingular,
    recordIds,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    objectNameSingular: string;
    recordIds: string[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Map<string, RecordPermissionsDTO>> {
    const allowedRecordIds = await this.findGrantedRecordIdsByOperationType({
      authContext,
      objectNameSingular,
      recordIds,
      operationTypes: ['read', 'update', 'destroy', 'softDelete'],
      transactionScope,
    });
    const isGranted = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => allowedRecordIds.get(operationType)?.has(recordId) ?? false;
    const isAllowed = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => isGranted(recordId, 'read') && isGranted(recordId, operationType);

    return new Map(
      recordIds.map((recordId) => [
        recordId,
        {
          canRead: isGranted(recordId, 'read'),
          canUpdate: isAllowed(recordId, 'update'),
          canDelete: isAllowed(recordId, 'destroy'),
          canSoftDelete: isAllowed(recordId, 'softDelete'),
        },
      ]),
    );
  }

  async canAccessSomeRecords({
    principals,
    objectMetadataId,
    operationType,
  }: ObjectOperationQuestion): Promise<boolean> {
    const request = await this.findObjectAccessRequest({
      principals,
      objectMetadataId,
      operationType,
    });

    if (!isDefined(request)) {
      return false;
    }

    if (
      isObjectOperationDisabledToPrincipals(request) ||
      isObjectOperationDeniedToPrincipals(request)
    ) {
      return false;
    }

    if (
      canAllRecordsOrRowLevelPermissionsGrantOperation(request) ||
      canRelatedRecordPathGrantOperation(request)
    ) {
      return true;
    }

    const shareGrant = resolvePermissionsShareGrant(request);

    if (!isDefined(shareGrant)) {
      return false;
    }

    const sharedAccessLevels =
      (
        await this.findSharedAccessLevelsByObjectMetadataId(request.principals)
      ).get(request.flatObjectMetadata.id) ?? [];

    return sharedAccessLevels.some((accessLevel) =>
      shareGrant.accessLevels.includes(accessLevel),
    );
  }

  async canAllRecordsOrRowLevelPermissionsGrantOperation(
    question: ObjectOperationQuestion,
  ): Promise<boolean> {
    const request = await this.findObjectAccessRequest(question);

    return (
      isDefined(request) &&
      canAllRecordsOrRowLevelPermissionsGrantOperation(request)
    );
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

  async canAccessRecords(question: RecordsOperationQuestion): Promise<boolean> {
    const grantedRecordIds = await this.findGrantedRecordIds(question);

    return (
      question.recordIds.length > 0 &&
      question.recordIds.every((recordId) =>
        grantedRecordIds.has(recordId.toLowerCase()),
      )
    );
  }

  async filterGrantedRecordIds(
    request: RecordsOperationQuestion,
  ): Promise<Set<string>> {
    const readRequest = await this.findObjectAccessRequest({
      principals: request.principals,
      objectMetadataId: request.objectMetadataId,
      operationType: 'read',
    });

    if (
      !isDefined(readRequest) ||
      (!isObjectOperationDisabledToPrincipals(readRequest) &&
        isObjectOperationDeniedToPrincipals(readRequest) &&
        readRequest.metadataMaps.featureFlagsMap[
          FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED
        ] !== true)
    ) {
      return new Set();
    }

    return this.findGrantedRecordIds(request);
  }

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

  async isReadDisabled({
    principals,
    objectMetadataId,
  }: Omit<RecordOperationQuestion, 'operationType'>): Promise<boolean> {
    return isObjectOperationDisabledToPrincipals(
      await this.findObjectAccessRequestOrThrow({
        principals,
        objectMetadataId,
        operationType: 'read',
      }),
    );
  }

  async assertCanRunOperationOrThrow({
    principals,
    objectMetadataId,
    operationType,
    selectedColumns,
    updatedColumns = [],
  }: RecordOperationQuestion & {
    selectedColumns: string[];
    updatedColumns?: string[];
  }): Promise<void> {
    const request = await this.findObjectAccessRequestOrThrow({
      principals,
      objectMetadataId,
      operationType,
    });
    const { flatObjectMetadata, metadataMaps } = request;

    if (isObjectOperationDisabledToPrincipals(request)) {
      throw new PermissionsException(
        `${PermissionsExceptionMessage.PERMISSION_DENIED}: records of "${flatObjectMetadata.nameSingular}" are not ${operationType === 'read' ? 'readable' : 'writable'} through the API`,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    if (isObjectOperationDeniedToPrincipals(request)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

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

  async buildReadRecordsAccessSQLCondition({
    tableAlias,
    ...question
  }: Omit<RecordOperationQuestion, 'operationType'> & {
    tableAlias: string;
  }): Promise<SQLCondition | boolean> {
    const objectAccessRequest = await this.findObjectAccessRequestOrThrow({
      ...question,
      operationType: 'read',
    });

    const [
      callerAccessGroupCompactIds,
      callerRelatedRecordPathAccessGroupCompactIds,
    ] = await Promise.all([
      this.findCallerAccessGroupCompactIds(objectAccessRequest),
      this.accessGroupReadService.findCallerRelatedRecordPathCompactIds(
        objectAccessRequest,
      ),
    ]);

    const sqlCondition = this.buildRecordsAccessSQLCondition({
      objectAccessRequest,
      tableAlias,
      callerAccessGroupCompactIds,
      callerRelatedRecordPathAccessGroupCompactIds,
    });

    if (!canRelatedRecordPathGrantOperation(objectAccessRequest)) {
      return sqlCondition;
    }

    return combineSQLConditionOutcomesWithOr([
      sqlCondition,
      this.buildRelatedRecordPathsSQLCondition({
        ...objectAccessRequest,
        tableAlias,
        isUncorrelated: true,
        buildEntrySQLCondition: (entry) =>
          entry.tableAlias !== tableAlias &&
          this.buildRecordShareOrCreatorEntrySQLCondition({
            ...objectAccessRequest,
            ...entry,
          }),
      }),
    ]);
  }

  private async findCallerAccessGroupCompactIds(
    objectAccessRequest: PermissionsObjectAccessRequest,
  ): Promise<number[] | undefined> {
    if (
      resolveRecordsAccessSQLConditionStrategy(objectAccessRequest) !==
      'accessGroups'
    ) {
      return undefined;
    }

    return this.accessGroupReadService.findCallerCompactIds({
      principals: objectAccessRequest.principals,
      objectMetadataId: objectAccessRequest.flatObjectMetadata.id,
      operationType: 'read',
    });
  }

  async buildWriteRecordsAccessSQLCondition({
    tableAlias,
    ...question
  }: RecordOperationQuestion & {
    operationType: Exclude<ObjectRecordsOperationType, 'read'>;
    tableAlias: string;
  }): Promise<SQLCondition | boolean> {
    const objectAccessRequest =
      await this.findObjectAccessRequestOrThrow(question);

    if (!canRelatedRecordPathGrantOperation(objectAccessRequest)) {
      return this.buildRecordsAccessSQLCondition({
        objectAccessRequest,
        tableAlias,
      });
    }

    return this.buildSelectableRecordsSQLCondition({
      ...objectAccessRequest,
      tableAlias,
    });
  }

  private buildRecordsAccessSQLCondition({
    objectAccessRequest,
    tableAlias,
    callerAccessGroupCompactIds,
    callerRelatedRecordPathAccessGroupCompactIds,
  }: {
    objectAccessRequest: PermissionsObjectAccessRequest;
    tableAlias: string;
    callerAccessGroupCompactIds?: number[];
    callerRelatedRecordPathAccessGroupCompactIds?: number[];
  }): SQLCondition | boolean {
    return buildPermissionsSQLCondition({
      ...objectAccessRequest,
      tableAlias,
      recordShareTableExpression: buildRecordShareTableExpression({
        workspaceId: objectAccessRequest.principals.workspaceId,
      }),
      callerAccessGroupCompactIds,
      callerRelatedRecordPathAccessGroupCompactIds,
    });
  }

  async assertCreatedRecordsMatchRowLevelPermissionsOrThrow({
    principals,
    objectMetadataId,
    records,
    transactionScope,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    records: ObjectRecord[];
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const { flatObjectMetadata, metadataMaps } =
      await this.findObjectAccessRequestOrThrow({
        principals,
        objectMetadataId,
        operationType: 'create',
      });

    await validateRLSPredicatesForRecords({
      records,
      objectMetadata: flatObjectMetadata,
      principals,
      metadataMaps,
      findRelationJoinValues: this.buildFindRelationJoinValues({
        workspaceId: principals.workspaceId,
        transactionScope,
      }),
    });
  }

  async assertUpdatesKeepRecordAccessOrThrow({
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
    const { flatObjectMetadata, metadataMaps } =
      await this.findObjectAccessRequestOrThrow({
        principals,
        objectMetadataId,
        operationType: 'update',
      });

    if (
      !isMainRoleRestrictedByRlsRule({
        principals,
        metadataMaps,
        objectMetadataId,
      })
    ) {
      return;
    }

    await assertUpdatedColumnsAreEditableOrThrow({
      principals,
      metadataMaps,
      flatObjectMetadata,
      updates,
      formatRecords,
      findRelationJoinValues: this.buildFindRelationJoinValues({
        workspaceId: principals.workspaceId,
        transactionScope,
      }),
    });

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

  private async findGrantedRecordIds({
    principals,
    objectMetadataId,
    operationType,
    recordIds,
    hypotheticalRecordShareAccessLevel,
    transactionScope,
  }: RecordsOperationQuestion): Promise<Set<string>> {
    const uniqueRecordIds = [
      ...new Set(recordIds.map((recordId) => recordId.toLowerCase())),
    ];

    if (uniqueRecordIds.length === 0 || !isDefined(principals)) {
      return new Set();
    }

    const request = await this.findObjectAccessRequest({
      principals,
      objectMetadataId,
      operationType,
    });

    if (!isDefined(request)) {
      return new Set();
    }

    const sqlCondition = this.buildSelectableRecordsSQLCondition({
      principals: request.principals,
      metadataMaps: request.metadataMaps,
      flatObjectMetadata: request.flatObjectMetadata,
      operationType: request.operationType,
      hypotheticalRecordShareAccessLevel,
    });

    if (sqlCondition === false) {
      return new Set();
    }

    return this.recordPermissionReadRepository.findRecordIdsMatchingSQLCondition(
      {
        workspaceId: principals.workspaceId,
        flatObjectMetadata: request.flatObjectMetadata,
        recordIds: uniqueRecordIds,
        sqlCondition,
        transactionScope,
      },
    );
  }

  private async findGrantedRecordIdsByOperationType({
    authContext,
    objectNameSingular,
    recordIds,
    operationTypes,
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    objectNameSingular: string;
    recordIds: string[];
    operationTypes: ObjectRecordsOperationType[];
    transactionScope?: RecordPermissionTransactionScope;
  }): Promise<Map<ObjectRecordsOperationType, Set<string>>> {
    const workspaceId = authContext.workspace.id;
    const isSystem = isSystemAuthContext(authContext);
    const principals = isSystem
      ? undefined
      : await this.principalPermissionsReadService.resolvePermissionsPrincipals(
          {
            authContext,
          },
        );

    if (recordIds.length === 0 || (!isSystem && !isDefined(principals))) {
      return new Map();
    }

    const metadataMaps = isDefined(principals)
      ? await this.permissionsMetadataMapsService.loadForPrincipals({
          principals,
        })
      : await this.permissionsMetadataMapsService.load({ workspaceId });
    const flatObjectMetadata = Object.values(
      metadataMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .find(({ nameSingular }) => nameSingular === objectNameSingular);

    if (!isDefined(flatObjectMetadata)) {
      return new Map();
    }

    const sqlConditions = operationTypes.map((operationType) =>
      isDefined(principals)
        ? this.buildSelectableRecordsSQLCondition({
            principals,
            metadataMaps,
            flatObjectMetadata,
            operationType,
          })
        : true,
    );
    const recordIdsBySQLCondition =
      await this.recordPermissionReadRepository.findRecordIdsMatchingSQLConditions(
        {
          workspaceId,
          flatObjectMetadata,
          recordIds,
          sqlConditions,
          transactionScope,
        },
      );

    return new Map(
      operationTypes.map((operationType, index) => [
        operationType,
        recordIdsBySQLCondition[index],
      ]),
    );
  }

  private buildSelectableRecordsSQLCondition({
    principals,
    metadataMaps,
    flatObjectMetadata,
    operationType,
    tableAlias = flatObjectMetadata.nameSingular,
    hypotheticalRecordShareAccessLevel,
  }: PermissionsObjectAccessRequest & {
    tableAlias?: string;
    hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  }): SQLCondition | boolean {
    if (
      operationType === 'create' ||
      metadataMaps.featureFlagsMap[
        FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED
      ] !== true
    ) {
      return this.buildEntrySQLCondition({
        principals,
        metadataMaps,
        flatObjectMetadata,
        operationType,
        tableAlias,
        hypotheticalRecordShareAccessLevel,
      });
    }

    return this.buildRelatedRecordPathsSQLCondition({
      principals,
      metadataMaps,
      flatObjectMetadata,
      operationType,
      tableAlias,
      buildEntrySQLCondition: (entry) =>
        this.buildEntrySQLCondition({
          principals,
          metadataMaps,
          operationType,
          ...entry,
          hypotheticalRecordShareAccessLevel:
            entry.flatObjectMetadata.id === flatObjectMetadata.id
              ? hypotheticalRecordShareAccessLevel
              : undefined,
        }),
    });
  }

  private buildRelatedRecordPathsSQLCondition({
    principals,
    metadataMaps,
    flatObjectMetadata,
    operationType,
    tableAlias,
    buildEntrySQLCondition,
    isUncorrelated,
  }: PermissionsObjectAccessRequest & {
    tableAlias: string;
    buildEntrySQLCondition: BuildEntrySQLCondition;
    isUncorrelated?: boolean;
  }): SQLCondition | boolean {
    return buildRelatedRecordPathsSQLCondition({
      workspaceId: principals.workspaceId,
      flatObjectMetadata,
      tableAlias,
      metadataMaps,
      buildEntrySQLCondition,
      isUncorrelated,
      canRelatedRecordPathsReachObject: (reachedFlatObjectMetadata) =>
        canRelatedRecordPathsReachObject({
          principals,
          metadataMaps,
          flatObjectMetadata: reachedFlatObjectMetadata,
          operationType,
        }),
      isRecordPrivacyApplicable: (reachedFlatObjectMetadata) =>
        isRecordPrivacyApplicable({
          metadataMaps,
          flatObjectMetadata: reachedFlatObjectMetadata,
          operationType,
        }),
    });
  }

  private buildRecordShareOrCreatorEntrySQLCondition({
    tableAlias,
    ...request
  }: PermissionsObjectAccessRequest & {
    tableAlias: string;
  }): SQLCondition | boolean {
    return (
      areRecordIdsReadableByPrincipals(request) &&
      buildRecordShareOrCreatorSQLCondition({
        ...request,
        tableAlias,
        recordShareTableExpression: buildRecordShareTableExpression({
          workspaceId: request.principals.workspaceId,
        }),
      })
    );
  }

  private buildEntrySQLCondition({
    principals,
    metadataMaps,
    flatObjectMetadata,
    operationType,
    tableAlias,
    hypotheticalRecordShareAccessLevel,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    metadataMaps: PermissionsMetadataMaps;
    flatObjectMetadata: FlatObjectMetadata;
    operationType: ObjectRecordsOperationType;
    tableAlias: string;
    hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  }): SQLCondition | boolean {
    if (
      !areRecordIdsReadableByPrincipals({
        principals,
        metadataMaps,
        flatObjectMetadata,
        operationType,
      })
    ) {
      return false;
    }

    return buildPermissionsSQLCondition({
      principals,
      metadataMaps,
      flatObjectMetadata,
      operationType,
      tableAlias,
      recordShareTableExpression: buildRecordShareTableExpression({
        workspaceId: principals.workspaceId,
      }),
      hypotheticalRecordShareAccessLevel,
    });
  }

  private async findObjectAccessRequest({
    principals,
    objectMetadataId,
    operationType,
  }: ObjectOperationQuestion): Promise<
    PermissionsObjectAccessRequest | undefined
  > {
    if (!isDefined(principals)) {
      return undefined;
    }

    const metadataMaps =
      await this.permissionsMetadataMapsService.loadForPrincipals({
        principals,
      });
    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps,
      objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    return { principals, metadataMaps, flatObjectMetadata, operationType };
  }

  private async findObjectAccessRequestOrThrow(
    question: RecordOperationQuestion,
  ): Promise<PermissionsObjectAccessRequest> {
    const request = await this.findObjectAccessRequest(question);

    if (!isDefined(request)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return request;
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

  private findSharedAccessLevelsByObjectMetadataId(
    principals: PermissionsPrincipalsWithRolesContext,
  ): Promise<Map<string, RecordShareAccessLevel[]>> {
    const cachedSharedAccessLevels =
      this.sharedAccessLevelsByPrincipals.get(principals);

    if (isDefined(cachedSharedAccessLevels)) {
      return cachedSharedAccessLevels;
    }

    const sharedAccessLevels =
      this.recordPermissionReadRepository.findRecordShareAccessLevelsByObjectMetadataId(
        {
          workspaceId: principals.workspaceId,
          principalIds: getPermissionsPrincipalsShareKeys(principals),
        },
      );

    this.sharedAccessLevelsByPrincipals.set(principals, sharedAccessLevels);

    // A failed query must not fail every later question on these principals
    sharedAccessLevels.catch(() => {
      this.sharedAccessLevelsByPrincipals.delete(principals);
    });

    return sharedAccessLevels;
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
      findRelationJoinValues: this.buildFindRelationJoinValues({
        workspaceId,
        transactionScope,
      }),
      fetchRecordShares: async ({
        objectMetadataId,
        recordIds: requestedRecordIds,
      }) => {
        const recordShareGrants =
          recordShareGrantsByObjectMetadataId.get(objectMetadataId) ??
          this.recordPermissionReadRepository.findRecordShares({
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
          this.privateRecordRepository.findPrivateRecordStates({
            workspaceId,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            recordIds,
            transactionScope,
          })),
    };
  }

  private buildFindRelationJoinValues({
    workspaceId,
    transactionScope,
  }: {
    workspaceId: string;
    transactionScope?: RecordPermissionTransactionScope;
  }): RowAccessEvaluationContext['findRelationJoinValues'] {
    return (args) =>
      this.recordPermissionReadRepository.findRelationJoinValues({
        ...args,
        workspaceId,
        transactionScope,
      });
  }
}
