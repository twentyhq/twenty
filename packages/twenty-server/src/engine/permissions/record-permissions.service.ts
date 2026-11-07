/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordsOperationType,
  type RecordShareAccessLevel,
  type RestrictedFieldPermissions,
  type RestrictedFieldsPermissions,
  type ObjectRecord,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/internal/role/utils/validate-operation-is-permitted-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-record-share-table-expression.util';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
  type RowAccessEvaluationContext,
  type RowAccessRecord,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/internal/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';
import { getEnforcedOperationType } from 'src/engine/permissions/internal/role/utils/get-enforced-operation-type.util';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { buildPermissionsCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-condition.util';
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
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-record-filter.util';
import { validateRLSPredicatesForRecords } from 'src/engine/permissions/internal/rls/utils/validate-rls-predicates-for-records.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';

type RecordOperationQuestion = {
  principals: PermissionsPrincipalsWithRolesContext;
  objectMetadataId: string;
  operationType: ObjectRecordsOperationType;
};

type ObjectQuestion = {
  principals: PermissionsPrincipalsWithRolesContext | undefined;
  objectMetadataId: string;
};

type ObjectOperationQuestion = ObjectQuestion & {
  operationType: ObjectRecordsOperationType;
};

type RecordsQuestion = ObjectQuestion & {
  recordIds: string[];
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  transactionScope?: RecordPermissionTransactionScope;
};

type RecordsOperationQuestion = RecordsQuestion & ObjectOperationQuestion;

@Injectable()
export class RecordPermissionsService {
  private readonly sharedAccessLevelsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<Map<string, RecordShareAccessLevel[]>>
  >();

  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
    private readonly principalPermissionsService: PrincipalPermissionsService,
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

    if (isRolePermittingOperation(request)) {
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
        isObjectOperationDeniedToPrincipals(readRequest))
    ) {
      return new Set();
    }

    return this.findGrantedRecordIds(request);
  }

  findUnreadableFields(question: ObjectQuestion): Promise<Set<string>> {
    return this.findDeniedFields({ ...question, fieldPermission: 'canRead' });
  }

  findUneditableFields(question: ObjectQuestion): Promise<Set<string>> {
    return this.findDeniedFields({ ...question, fieldPermission: 'canUpdate' });
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

  async buildRecordsAccessCondition({
    tableAlias,
    ...question
  }: RecordOperationQuestion & {
    tableAlias: string;
  }): Promise<SqlCondition | boolean> {
    const { principals } = question;

    return buildPermissionsCondition({
      ...(await this.findObjectAccessRequestOrThrow(question)),
      tableAlias,
      recordShareTableExpression: buildRecordShareTableExpression({
        workspaceId: principals.workspaceId,
      }),
    });
  }

  async assertCreatedRecordsMatchRowLevelPermissionsOrThrow({
    principals,
    objectMetadataId,
    records,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    records: ObjectRecord[];
  }): Promise<void> {
    const { flatObjectMetadata, metadataMaps } =
      await this.findObjectAccessRequestOrThrow({
        principals,
        objectMetadataId,
        operationType: 'create',
      });

    validateRLSPredicatesForRecords({
      records,
      objectMetadata: flatObjectMetadata,
      principals,
      metadataMaps,
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

    const condition = this.buildSelectableRecordsCondition({
      principals: request.principals,
      metadataMaps: request.metadataMaps,
      flatObjectMetadata: request.flatObjectMetadata,
      operationType: request.operationType,
      hypotheticalRecordShareAccessLevel,
    });

    if (condition === false) {
      return new Set();
    }

    return this.recordPermissionReadRepository.findRecordIdsMatchingCondition({
      workspaceId: principals.workspaceId,
      flatObjectMetadata: request.flatObjectMetadata,
      recordIds: uniqueRecordIds,
      condition,
      transactionScope,
    });
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
      : await this.principalPermissionsService.resolvePermissionsPrincipals({
          authContext,
        });

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

    const conditions = operationTypes.map((operationType) =>
      isDefined(principals)
        ? this.buildSelectableRecordsCondition({
            principals,
            metadataMaps,
            flatObjectMetadata,
            operationType,
          })
        : true,
    );
    const recordIdsByCondition =
      await this.recordPermissionReadRepository.findRecordIdsMatchingConditions(
        {
          workspaceId,
          flatObjectMetadata,
          recordIds,
          conditions,
          transactionScope,
        },
      );

    return new Map(
      operationTypes.map((operationType, index) => [
        operationType,
        recordIdsByCondition[index],
      ]),
    );
  }

  private buildSelectableRecordsCondition({
    principals,
    metadataMaps,
    flatObjectMetadata,
    operationType,
    hypotheticalRecordShareAccessLevel,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    metadataMaps: PermissionsMetadataMaps;
    flatObjectMetadata: FlatObjectMetadata;
    operationType: ObjectRecordsOperationType;
    hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  }): SqlCondition | boolean {
    try {
      validateOperationIsPermittedOrThrow({
        entityName: flatObjectMetadata.nameSingular,
        operationType,
        recordsPermissions: getPermissionsPrincipalsRecordsPermissions({
          principals,
          metadataMaps,
        }),
        flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
        flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
        objectIdByNameSingular: {
          [flatObjectMetadata.nameSingular]: flatObjectMetadata.id,
        },
        selectedColumns: ['id'],
        updatedColumns: [],
      });
    } catch (error) {
      if (
        error instanceof PermissionsException &&
        error.code === PermissionsExceptionCode.PERMISSION_DENIED
      ) {
        return false;
      }

      throw error;
    }

    return buildPermissionsCondition({
      principals,
      metadataMaps,
      flatObjectMetadata,
      operationType,
      recordShareTableExpression: buildRecordShareTableExpression({
        workspaceId: principals.workspaceId,
      }),
      hypotheticalRecordShareAccessLevel,
    });
  }

  private async findDeniedFields({
    principals,
    objectMetadataId,
    fieldPermission,
  }: ObjectQuestion & {
    fieldPermission: keyof RestrictedFieldPermissions;
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

    return new Set(
      Object.entries(objectRecordsPermissions.restrictedFields)
        .filter(
          ([, restrictedField]) =>
            restrictedField.canRead === false ||
            restrictedField[fieldPermission] === false,
        )
        .map(([fieldMetadataId]) => fieldMetadataId),
    );
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
          this.recordPermissionReadRepository.findPrivateRecordStates({
            workspaceId,
            flatObjectMetadata,
            flatFieldMetadataMaps,
            recordIds,
            transactionScope,
          })),
    };
  }
}
