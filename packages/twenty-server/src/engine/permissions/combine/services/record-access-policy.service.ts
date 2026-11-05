/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type RecordShareAccessLevel,
  type RestrictedFieldPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { PermissionsPrincipalsService } from 'src/engine/permissions/principal/services/permissions-principals.service';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principals-records-permissions.util';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/record-permission-orm/services/record-permission-read-orm.service';
import { buildRecordShareTableExpression } from 'src/engine/permissions/record-permission-orm/utils/build-record-share-table-expression.util';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principals-role-ids.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/principal/utils/get-permissions-principals-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/role/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/role/utils/is-object-operation-disabled-to-principals.util';
import { isRoleGrantingOperationOnAllRecords } from 'src/engine/permissions/role/utils/is-role-granting-operation-on-all-records.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { buildPermissionsCondition } from 'src/engine/permissions/combine/utils/build-permissions-condition.util';
import { filterReadableEvents } from 'src/engine/permissions/combine/utils/filter-readable-events.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/combine/services/permissions-metadata-maps.service';
import { findGrantedRecordIds } from 'src/engine/permissions/combine/utils/find-granted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-snapshots.util';
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
  transactionScope?: WorkspaceTransactionScope;
};

type EventBatchAccessLoaders = {
  loadMetadataMaps: () => Promise<PermissionsMetadataMaps>;
  findReadableRecordIdsInBatch: (
    principals: PermissionsPrincipalsWithRolesContext,
  ) => Promise<Set<string>>;
};

@Injectable()
export class RecordAccessPolicyService {
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
    private readonly permissionsPrincipalsService: PermissionsPrincipalsService,
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

  async hasAccessToAllRecords({
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

    return (
      !isObjectOperationDisabledToPrincipals(request) &&
      isRoleGrantingOperationOnAllRecords(request)
    );
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

    const condition = buildPermissionsCondition({
      principals: request.principals,
      metadataMaps: request.metadataMaps,
      flatObjectMetadata: request.flatObjectMetadata,
      operationType: request.operationType,
      recordShareTableExpression: buildRecordShareTableExpression({
        workspaceId: principals.workspaceId,
      }),
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

  async hasFieldPermission({
    principals,
    objectMetadataId,
    fieldMetadataId,
    fieldPermission,
  }: {
    principals: PermissionsPrincipalsWithRolesContext | undefined;
    objectMetadataId: string;
    fieldMetadataId: string;
    fieldPermission: keyof RestrictedFieldPermissions;
  }): Promise<boolean> {
    if (!isDefined(principals)) {
      return false;
    }

    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps: await this.findPrincipalsMetadataMaps(principals),
      objectMetadataId,
    });

    if (!flatObjectMetadata?.fieldIds.includes(fieldMetadataId)) {
      return false;
    }

    const deniedFieldMetadataIds = await this.findDeniedFieldMetadataIdsOrThrow(
      {
        principals,
        objectMetadataId,
        fieldPermission,
      },
    );

    return !deniedFieldMetadataIds.has(fieldMetadataId);
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
    return this.permissionsPrincipalsService.findPrincipalsWithRoles(
      authContext,
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

  private findPrincipalsRecordsPermissions(
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
