/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  type ObjectRecordsOperationType,
  type RecordShareAccessLevel,
  type RestrictedFieldPermissions,
  type RestrictedFieldsPermissions,
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
import { RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { buildRecordShareTableExpression } from 'src/engine/permissions/internal/record-permission-orm/utils/build-record-share-table-expression.util';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
} from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/internal/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';
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

type FieldsQuestion = Omit<ObjectQuestion, 'principals'> & {
  principals: PermissionsPrincipalsWithRolesContext;
};

@Injectable()
export class RecordPermissionsService {
  private readonly sharedAccessLevelsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<Map<string, RecordShareAccessLevel[]>>
  >();

  constructor(
    private readonly permissionsMetadataMapsService: PermissionsMetadataMapsService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
    private readonly principalPermissionsService: PrincipalPermissionsService,
  ) {}

  async findRecordsPermissions({
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
      operationTypes: ['select', 'update', 'delete', 'soft-delete'],
      transactionScope,
    });
    const isGranted = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => allowedRecordIds.get(operationType)?.has(recordId) ?? false;
    const isAllowed = (
      recordId: string,
      operationType: ObjectRecordsOperationType,
    ) => isGranted(recordId, 'select') && isGranted(recordId, operationType);

    return new Map(
      recordIds.map((recordId) => [
        recordId,
        {
          canRead: isGranted(recordId, 'select'),
          canUpdate: isAllowed(recordId, 'update'),
          canDelete: isAllowed(recordId, 'delete'),
          canSoftDelete: isAllowed(recordId, 'soft-delete'),
        },
      ]),
    );
  }

  async findRestrictedFields({
    principals,
    objectMetadataId,
  }: ObjectQuestion): Promise<RestrictedFieldsPermissions> {
    if (!isDefined(principals)) {
      return {};
    }

    const { objects } =
      await this.permissionsMetadataMapsService.loadRecordsPermissionsForPrincipals(
        { principals },
      );

    return objects[objectMetadataId]?.restrictedFields ?? {};
  }

  async hasAccessToSomeRecords({
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

  async canRoleReachSomeRecords({
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

    return canReachSomeRecords({
      objectRecordsPermissions: objects[objectMetadataId],
      operationType,
    });
  }

  public canReadRecords(question: RecordsQuestion): Promise<boolean> {
    return this.coversEveryRecord({ question, operationType: 'select' });
  }

  public canUpdateRecords(question: RecordsQuestion): Promise<boolean> {
    return this.coversEveryRecord({ question, operationType: 'update' });
  }

  async findGrantedRecordIdsOnReadableObject(
    request: RecordsOperationQuestion,
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

  public findUnreadableFieldMetadataIdsOrThrow(
    question: FieldsQuestion,
  ): Promise<Set<string>> {
    return this.findDeniedFieldMetadataIdsOrThrow({
      ...question,
      fieldPermission: 'canRead',
    });
  }

  public findNonUpdatableFieldMetadataIdsOrThrow(
    question: FieldsQuestion,
  ): Promise<Set<string>> {
    return this.findDeniedFieldMetadataIdsOrThrow({
      ...question,
      fieldPermission: 'canUpdate',
    });
  }

  async findRoleIdsUnableToReadObject({
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
            operationType: 'select',
          }),
      ),
    );
  }

  private async coversEveryRecord({
    question,
    operationType,
  }: {
    question: RecordsQuestion;
    operationType: ObjectRecordsOperationType;
  }): Promise<boolean> {
    const grantedRecordIds = await this.findGrantedRecordIds({
      ...question,
      operationType,
    });

    return (
      question.recordIds.length > 0 &&
      question.recordIds.every((recordId) =>
        grantedRecordIds.has(recordId.toLowerCase()),
      )
    );
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

    return this.recordPermissionReadOrmService.findRecordIdsMatchingCondition({
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
      : await this.principalPermissionsService.buildPermissionsPrincipals({
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
      await this.recordPermissionReadOrmService.findRecordIdsMatchingConditions(
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

  private async findDeniedFieldMetadataIdsOrThrow({
    principals,
    objectMetadataId,
    fieldPermission,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
    objectMetadataId: string;
    fieldPermission: keyof RestrictedFieldPermissions;
  }): Promise<Set<string>> {
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
      this.recordPermissionReadOrmService.findRecordShareAccessLevelsByObjectMetadataId(
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
}
