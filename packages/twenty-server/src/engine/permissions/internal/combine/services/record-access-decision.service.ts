/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectRecord,
  type ObjectRecordsOperationType,
  type RecordShareAccessLevel,
  type RestrictedFieldPermissions,
  type RestrictedFieldsPermissions,
} from 'twenty-shared/types';
import { canReachSomeRecords, isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

import { isSystemAuthContext } from 'src/engine/core-modules/auth/guards/is-system-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { validateOperationIsPermittedOrThrow } from 'src/engine/permissions/internal/role/utils/validate-operation-is-permitted-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { PrincipalPermissionsService } from 'src/engine/permissions/principal-permissions.service';
import { buildRolePermissionsPrincipals } from 'src/engine/permissions/internal/principal/utils/build-role-permissions-principals.util';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { type PrivateRecordState } from 'src/engine/permissions/internal/private-record/types/private-record-state.type';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-orm/utils/build-record-share-table-expression.util';
import { type RecordShareGrant } from 'src/engine/permissions/internal/record-share/types/record-share-grant.type';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
  type RowAccessEvaluationContext,
  type RowAccessRecord,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-record-filter.util';
import { validateRLSPredicatesForRecords } from 'src/engine/permissions/internal/rls/utils/validate-rls-predicates-for-records.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/internal/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { type RecordReadRestrictions } from 'src/engine/permissions/types/record-read-restrictions.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { buildPermissionsCondition } from 'src/engine/permissions/internal/combine/utils/build-permissions-condition.util';
import { filterReadableEvents } from 'src/engine/permissions/internal/combine/utils/filter-readable-events.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/internal/combine/services/permissions-metadata-maps.service';
import { findGrantedRecordIds } from 'src/engine/permissions/internal/combine/utils/find-granted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/internal/combine/utils/resolve-event-record-snapshots.util';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type PrincipalsObjectAccessRequest = Pick<
  PermissionsObjectAccessRequest,
  'operationType'
> & {
  principals: PermissionsObjectAccessRequest['principals'] | undefined;
  objectMetadataId: string;
};

type PrincipalsRecordsAccessRequest = PrincipalsObjectAccessRequest & {
  recordIds: string[];
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  transactionScope?: RecordPermissionTransactionScope;
};

type EventBatchAccessLoaders = {
  loadMetadataMaps: () => Promise<PermissionsMetadataMaps>;
  findReadableRecordIdsInBatch: (
    principals: PermissionsPrincipalsWithRolesContext,
  ) => Promise<Set<string>>;
};

export type RecordOperationQuestion = {
  principals: PermissionsPrincipalsWithRolesContext;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: ObjectRecordsOperationType;
};

@Injectable()
export class RecordAccessDecisionService {
  private readonly metadataMapsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<PermissionsMetadataMaps>
  >();

  private readonly recordsPermissionsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<RoleRecordsPermissions>
  >();

  private readonly sharedAccessLevelsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<Map<string, RecordShareAccessLevel[]>>
  >();

  private readonly accessLoadersByEventBatch = new WeakMap<
    WorkspaceEventBatch<ObjectRecordEvent>,
    EventBatchAccessLoaders
  >();

  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
  ) {}

  private async findObjectAccessRequest({
    principals,
    objectMetadataId,
    operationType,
  }: PrincipalsObjectAccessRequest): Promise<
    PermissionsObjectAccessRequest | undefined
  > {
    if (!isDefined(principals)) {
      return undefined;
    }

    const metadataMaps = await this.findPrincipalsMetadataMaps(principals);
    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps,
      objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      return undefined;
    }

    return { principals, metadataMaps, flatObjectMetadata, operationType };
  }

  async hasAccessToSomeRecords({
    principals,
    objectMetadataId,
    operationType,
  }: PrincipalsObjectAccessRequest): Promise<boolean> {
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

  async findGrantedRecordIds({
    principals,
    objectMetadataId,
    operationType,
    recordIds,
    hypotheticalRecordShareAccessLevel,
    transactionScope,
  }: PrincipalsRecordsAccessRequest): Promise<Set<string>> {
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

    return this.recordPermissionReadOrmService.findRecordIdsMatchingCondition({
      workspaceId: principals.workspaceId,
      flatObjectMetadata: request.flatObjectMetadata,
      recordIds: uniqueRecordIds,
      condition,
      transactionScope,
    });
  }

  async findGrantedRecordIdsOnReadableObject(
    request: PrincipalsRecordsAccessRequest,
  ): Promise<Set<string>> {
    const readRequest = await this.findObjectAccessRequest({
      principals: request.principals,
      objectMetadataId: request.objectMetadataId,
      operationType: 'select',
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

  async canRoleReachSomeRecords({
    principals,
    objectMetadataId,
    operationType,
  }: PrincipalsObjectAccessRequest): Promise<boolean> {
    if (!isDefined(principals)) {
      return false;
    }

    const { objects } = await this.findPrincipalsRecordsPermissions(principals);

    return canReachSomeRecords({
      objectRecordsPermissions: objects[objectMetadataId],
      operationType,
    });
  }

  async findRestrictedFields({
    principals,
    objectMetadataId,
  }: {
    principals: PermissionsPrincipalsWithRolesContext | undefined;
    objectMetadataId: string;
  }): Promise<RestrictedFieldsPermissions> {
    if (!isDefined(principals)) {
      return {};
    }

    const { objects } = await this.findPrincipalsRecordsPermissions(principals);

    return objects[objectMetadataId]?.restrictedFields ?? {};
  }

  async findRecordReadRestrictions(
    principals: PermissionsPrincipalsWithRolesContext,
  ): Promise<RecordReadRestrictions> {
    return buildRecordReadRestrictions({
      recordsPermissions:
        await this.findPrincipalsRecordsPermissions(principals),
    });
  }

  async findRoleIdsUnableToReachObject({
    workspaceId,
    roleIds,
    objectMetadataId,
    operationType,
  }: {
    workspaceId: string;
    roleIds: string[];
    objectMetadataId: string;
    operationType: ObjectRecordsOperationType;
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
            operationType,
          }),
      ),
    );
  }

  async findGrantedRecordIdsByOperationType({
    authContext,
    objectNameSingular,
    recordIds,
    operationTypes,
  }: {
    authContext: WorkspaceAuthContext;
    objectNameSingular: string;
    recordIds: string[];
    operationTypes: ObjectRecordsOperationType[];
  }): Promise<Map<ObjectRecordsOperationType, Set<string>>> {
    const workspaceId = authContext.workspace.id;
    const isSystem = isSystemAuthContext(authContext);
    const principals = isSystem
      ? undefined
      : await this.principalPermissionsService.buildPermissionsPrincipals({
          authContext,
        });

    if (recordIds.length === 0 || (!isSystem && !isDefined(principals))) {
      return new Map();
    }

    const metadataMaps = isDefined(principals)
      ? await this.findPrincipalsMetadataMaps(principals)
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
      await this.recordPermissionReadOrmService.findRecordIdsMatchingConditions(
        {
          workspaceId,
          flatObjectMetadata,
          recordIds,
          conditions,
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

  async isOperationDisabled(
    question: RecordOperationQuestion,
  ): Promise<boolean> {
    return isObjectOperationDisabledToPrincipals({
      ...question,
      metadataMaps: await this.findPrincipalsMetadataMaps(question.principals),
    });
  }

  async assertObjectOperationAccessibleOrThrow(
    question: RecordOperationQuestion,
  ): Promise<void> {
    const metadataMaps = await this.findPrincipalsMetadataMaps(
      question.principals,
    );

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
    const metadataMaps = await this.findPrincipalsMetadataMaps(principals);

    validateOperationIsPermittedOrThrow({
      entityName: flatObjectMetadata.nameSingular,
      operationType,
      recordsPermissions:
        await this.findPrincipalsRecordsPermissions(principals),
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
      metadataMaps: await this.findPrincipalsMetadataMaps(principals),
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
      metadataMaps: await this.findPrincipalsMetadataMaps(principals),
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
    const metadataMaps = await this.findPrincipalsMetadataMaps(principals);

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

  async findDeniedFieldMetadataIdsOrThrow({
    principals,
    objectMetadataId,
    fieldPermission,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    fieldPermission: keyof RestrictedFieldPermissions;
  }): Promise<Set<string>> {
    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps: await this.findPrincipalsMetadataMaps(principals),
      objectMetadataId,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
        PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    const objectRecordsPermissions = (
      await this.findPrincipalsRecordsPermissions(principals)
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

  async findReadableEventRecordIds({
    authContext,
    eventBatch,
  }: {
    authContext: PermissionsAuthContext;
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  }): Promise<Set<string>> {
    const principals = await this.resolvePrincipalsWithRoles(authContext);

    return isDefined(principals)
      ? this.findEventBatchAccessLoaders(
          eventBatch,
        ).findReadableRecordIdsInBatch(principals)
      : new Set<string>();
  }

  async findReadableEvents<TEvent extends ObjectRecordEvent>({
    authContext,
    eventBatch,
    events = eventBatch.events,
  }: {
    authContext: PermissionsAuthContext;
    eventBatch: WorkspaceEventBatch<TEvent>;
    events?: TEvent[];
  }): Promise<TEvent[]> {
    const principals = await this.resolvePrincipalsWithRoles(authContext);

    if (!isDefined(principals)) {
      return [];
    }

    const { loadMetadataMaps, findReadableRecordIdsInBatch } =
      this.findEventBatchAccessLoaders(eventBatch);
    const metadataMaps = await loadMetadataMaps();

    if (
      getPermissionsPrincipalsRoleIds(principals).some(
        (roleId) => !isDefined(metadataMaps.rolesPermissions[roleId]),
      )
    ) {
      return [];
    }

    return filterReadableEvents({
      events,
      readableRecordIds: await findReadableRecordIdsInBatch(principals),
      objectMetadata: eventBatch.objectMetadata,
      recordsPermissions: getPermissionsPrincipalsRecordsPermissions({
        principals,
        metadataMaps,
      }),
      metadataMaps,
    });
  }

  private findEventBatchAccessLoaders(
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): EventBatchAccessLoaders {
    const cachedLoaders = this.accessLoadersByEventBatch.get(eventBatch);

    if (isDefined(cachedLoaders)) {
      return cachedLoaders;
    }

    const { workspaceId, objectMetadata, events } = eventBatch;

    // One lookup per object for the whole batch: operands only ever ask for
    // records of the batch, so later calls are served from what was fetched
    const recordSharesByRecordIdByObject = new Map<
      string,
      Map<string, Promise<RecordShareGrant[]>>
    >();
    const fetchRecordShares = async ({
      objectMetadataId,
      recordIds,
    }: {
      objectMetadataId: string;
      recordIds: string[];
    }) => {
      const recordSharesByRecordId =
        recordSharesByRecordIdByObject.get(objectMetadataId) ??
        new Map<string, Promise<RecordShareGrant[]>>();

      recordSharesByRecordIdByObject.set(
        objectMetadataId,
        recordSharesByRecordId,
      );

      const uniqueRecordIds = [
        ...new Set(recordIds.map((recordId) => recordId.toLowerCase())),
      ];
      const missingRecordIds = uniqueRecordIds.filter(
        (recordId) => !recordSharesByRecordId.has(recordId),
      );

      if (missingRecordIds.length > 0) {
        const groupedRecordShares = this.recordPermissionReadOrmService
          .findRecordShares({
            workspaceId,
            objectMetadataId,
            recordIds: missingRecordIds,
          })
          .then((recordShares) =>
            groupBy(recordShares, (recordShare) => recordShare.recordId),
          );

        for (const recordId of missingRecordIds) {
          recordSharesByRecordId.set(
            recordId,
            groupedRecordShares.then(
              (recordSharesOfRecord) => recordSharesOfRecord[recordId] ?? [],
            ),
          );
        }
      }

      const recordSharesPerRecord = await Promise.all(
        uniqueRecordIds.map(
          (recordId) => recordSharesByRecordId.get(recordId) ?? [],
        ),
      );

      return recordSharesPerRecord.flat();
    };

    let metadataMaps: Promise<PermissionsMetadataMaps> | undefined;
    const loadMetadataMaps = () =>
      (metadataMaps ??= this.permissionsMetadataMapsService.load({
        workspaceId,
      }));

    let privateRecordStates:
      | Promise<Map<string, PrivateRecordState>>
      | undefined;
    const findPrivateRecordStates = () =>
      (privateRecordStates ??= loadMetadataMaps().then(
        ({ flatFieldMetadataMaps }) =>
          this.recordPermissionReadOrmService.findPrivateRecordStates({
            workspaceId,
            flatObjectMetadata: objectMetadata,
            flatFieldMetadataMaps,
            recordIds: resolveEventRecordSnapshots(events).map(
              (record) => record.id,
            ),
          }),
      ));

    const findReadableRecordIdsInBatch = async (
      principals: PermissionsPrincipalsWithRolesContext,
    ) =>
      findGrantedRecordIds({
        principals,
        metadataMaps: await loadMetadataMaps(),
        flatObjectMetadata: objectMetadata,
        operationType: 'select',
        records: resolveEventRecordSnapshots(events),
        context: {
          shouldIgnoreSoftDeleteDefaultFilter: true,
          fetchRecordShares,
          findPrivateRecordStates,
        },
      });

    const loaders = { loadMetadataMaps, findReadableRecordIdsInBatch };

    this.accessLoadersByEventBatch.set(eventBatch, loaders);

    return loaders;
  }

  private resolvePrincipalsWithRoles(
    authContext: PermissionsAuthContext,
  ): Promise<PermissionsPrincipalsWithRolesContext | undefined> {
    return this.principalPermissionsService.buildPermissionsPrincipals({
      authContext,
    });
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

  private findPrincipalsMetadataMaps(
    principals: PermissionsPrincipalsWithRolesContext,
  ): Promise<PermissionsMetadataMaps> {
    const cachedMetadataMaps = this.metadataMapsByPrincipals.get(principals);

    if (isDefined(cachedMetadataMaps)) {
      return cachedMetadataMaps;
    }

    const metadataMaps = this.permissionsMetadataMapsService.load({
      workspaceId: principals.workspaceId,
    });

    this.metadataMapsByPrincipals.set(principals, metadataMaps);

    return metadataMaps;
  }

  findPrincipalsRecordsPermissions(
    principals: PermissionsPrincipalsWithRolesContext,
  ): Promise<RoleRecordsPermissions> {
    const cachedRecordsPermissions =
      this.recordsPermissionsByPrincipals.get(principals);

    if (isDefined(cachedRecordsPermissions)) {
      return cachedRecordsPermissions;
    }

    const recordsPermissions = this.findPrincipalsMetadataMaps(principals).then(
      (metadataMaps) =>
        getPermissionsPrincipalsRecordsPermissions({
          principals,
          metadataMaps,
        }),
    );

    this.recordsPermissionsByPrincipals.set(principals, recordsPermissions);

    return recordsPermissions;
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
      this.recordPermissionReadOrmService.findRecordShareAccessLevelsByObjectMetadataId(
        {
          workspaceId: principals.workspaceId,
          principalIds: getPermissionsPrincipalsShareKeys(principals),
        },
      );

    this.sharedAccessLevelsByPrincipals.set(principals, sharedAccessLevels);

    return sharedAccessLevels;
  }
}
