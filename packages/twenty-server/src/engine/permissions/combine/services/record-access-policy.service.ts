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
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
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
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { filterReadableEvents } from 'src/engine/permissions/combine/utils/filter-readable-events.util';
import { loadPermissionsMetadataMaps } from 'src/engine/permissions/combine/utils/load-permissions-metadata-maps.util';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-snapshots.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
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
  findAdmittedRecordIds: (
    principals: PermissionsPrincipalsWithRolesContext,
  ) => Promise<Set<string>>;
};

// Internal to engine/permissions: callers ask PermissionsService instead
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
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

  // Shares only count once a row exists, so an object reached by nothing stays out of reach
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

  // Ids come back lowercased, as the records store them
  async findAdmittedRecordIds({
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

    const { flatObjectMetadata } = request;

    const findAdmittedRecordIds = (repository: WorkspaceRepository) =>
      repository.findPrincipalsAdmittedRecordIds({
        principals,
        recordIds: uniqueRecordIds,
        operationType,
        hypotheticalRecordShareAccessLevel,
      });

    return this.withBypassingRepository({
      workspaceId: principals.workspaceId,
      objectNameSingular: flatObjectMetadata.nameSingular,
      transactionScope,
      work: findAdmittedRecordIds,
    });
  }

  // Ids of the object's fields the intersected roles do not restrict for this permission
  async findPermittedFieldMetadataIds({
    principals,
    objectMetadataId,
    fieldPermission,
  }: {
    principals: PermissionsPrincipalsWithRolesContext | undefined;
    objectMetadataId: string;
    fieldPermission: keyof RestrictedFieldPermissions;
  }): Promise<string[]> {
    if (!isDefined(principals)) {
      return [];
    }

    const metadataMaps = await this.findPrincipalsMetadataMaps(principals);
    const flatObjectMetadata = this.findFlatObjectMetadata({
      metadataMaps,
      objectMetadataId,
    });
    const objectRecordsPermissions = (
      await this.findPrincipalsRecordsPermissions(principals)
    ).objects[objectMetadataId];

    if (
      !isDefined(flatObjectMetadata) ||
      !isDefined(objectRecordsPermissions)
    ) {
      return [];
    }

    return flatObjectMetadata.fieldIds.filter(
      (fieldMetadataId) =>
        objectRecordsPermissions.restrictedFields[fieldMetadataId]?.[
          fieldPermission
        ] !== false,
    );
  }

  async findAccessibleEventRecordIds({
    authContext,
    eventBatch,
  }: {
    authContext: PermissionsAuthContext;
    eventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
  }): Promise<Set<string>> {
    const principals = await this.resolvePrincipalsWithRoles(authContext);

    return isDefined(principals)
      ? this.findEventBatchAccessLoaders(eventBatch).findAdmittedRecordIds(
          principals,
        )
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

    const { loadMetadataMaps, findAdmittedRecordIds } =
      this.findEventBatchAccessLoaders(eventBatch);
    const metadataMaps = await loadMetadataMaps();

    // A role missing from the cache must not fall through to share or creator admission
    if (
      getPermissionsPrincipalsRoleIds(principals).some(
        (roleId) => !isDefined(metadataMaps.rolesPermissions[roleId]),
      )
    ) {
      return [];
    }

    return filterReadableEvents({
      events,
      admittedRecordIds: await findAdmittedRecordIds(principals),
      objectMetadata: eventBatch.objectMetadata,
      recordsPermissions: getPermissionsPrincipalsRecordsPermissions({
        principals,
        metadataMaps,
      }),
      metadataMaps,
    });
  }

  // Shared by every principal asking about the same batch
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
      Map<string, Promise<RecordShare[]>>
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
        new Map<string, Promise<RecordShare[]>>();

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
        const groupedRecordShares = this.recordShareStorageService
          .findByRecordIds({
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

    let privateRecordStates:
      | Promise<Map<string, PrivateRecordState>>
      | undefined;
    const findPrivateRecordStates = () =>
      (privateRecordStates ??= this.privateRecordStorageService.findStates({
        workspaceId,
        flatObjectMetadata: objectMetadata,
        recordIds: resolveEventRecordSnapshots(events).map(
          (record) => record.id,
        ),
      }));

    let metadataMaps: Promise<PermissionsMetadataMaps> | undefined;
    const loadMetadataMaps = () =>
      (metadataMaps ??= loadPermissionsMetadataMaps({
        workspaceCacheService: this.workspaceCacheService,
        workspaceId,
      }));

    const findAdmittedRecordIds = async (
      principals: PermissionsPrincipalsWithRolesContext,
    ) =>
      findPermissionsAdmittedRecordIds({
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

    const loaders = { loadMetadataMaps, findAdmittedRecordIds };

    this.accessLoadersByEventBatch.set(eventBatch, loaders);

    return loaders;
  }

  private withBypassingRepository<TResult>({
    workspaceId,
    objectNameSingular,
    transactionScope,
    work,
  }: {
    workspaceId: string;
    objectNameSingular: string;
    transactionScope?: WorkspaceTransactionScope;
    work: (repository: WorkspaceRepository) => Promise<TResult>;
  }): Promise<TResult> {
    if (isDefined(transactionScope)) {
      return work(
        transactionScope.getRepositoryWithoutPermissionChecks(
          objectNameSingular,
        ),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
            objectNameSingular,
          ),
        ),
      buildSystemAuthContext(workspaceId),
    );
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

    const metadataMaps = loadPermissionsMetadataMaps({
      workspaceCacheService: this.workspaceCacheService,
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
      this.recordShareStorageService.findAccessLevelsByObjectMetadataId({
        workspaceId: principals.workspaceId,
        principalIds: getPermissionsPrincipalsShareKeys(principals),
      });

    this.sharedAccessLevelsByPrincipals.set(principals, sharedAccessLevels);

    return sharedAccessLevels;
  }
}
