/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalShareKeys } from 'src/engine/permissions/principal/utils/get-permissions-principal-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-denied-to-principal.util';
import { isObjectOperationDisabledToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-disabled-to-principal.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-snapshots.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

@Injectable()
export class RecordAccessPolicyService {
  private readonly metadataMapsByPrincipal = new WeakMap<
    PermissionsPrincipal,
    Promise<PermissionsMetadataMaps>
  >();

  private readonly sharedAccessLevelsByPrincipal = new WeakMap<
    PermissionsPrincipal,
    Promise<Map<string, RecordShareAccessLevel[]>>
  >();

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  // Shares only count once a row exists, so an object reached by nothing stays out of reach
  async hasAccessToSomeRecords({
    principal,
    flatObjectMetadata,
    operationType,
  }: Omit<PermissionsObjectAccessRequest, 'metadataMaps'>): Promise<boolean> {
    const request = {
      principal,
      metadataMaps: await this.findPrincipalMetadataMaps(principal),
      flatObjectMetadata,
      operationType,
    };

    if (
      isObjectOperationDisabledToPrincipal(request) ||
      isObjectOperationDeniedToPrincipal(request)
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
      (await this.findSharedAccessLevelsByObjectMetadataId(principal)).get(
        flatObjectMetadata.id,
      ) ?? [];

    return sharedAccessLevels.some((accessLevel) =>
      shareGrant.accessLevels.includes(accessLevel),
    );
  }

  async hasAccessToRecords({
    principal,
    flatObjectMetadata,
    operationType,
    recordIds,
    hypotheticalRecordShareAccessLevel,
    transactionScope,
  }: Omit<PermissionsObjectAccessRequest, 'metadataMaps'> & {
    recordIds: string[];
    hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<boolean> {
    const uniqueRecordIds = [...new Set(recordIds)];

    if (uniqueRecordIds.length === 0) {
      return false;
    }
    const findAdmittedRecordIds = (repository: WorkspaceRepository) =>
      repository.findPrincipalAdmittedRecordIds({
        principal,
        recordIds: uniqueRecordIds,
        operationType,
        hypotheticalRecordShareAccessLevel,
      });
    const admittedRecordIds = await this.withBypassingRepository({
      workspaceId: principal.workspaceId,
      objectNameSingular: flatObjectMetadata.nameSingular,
      transactionScope,
      work: findAdmittedRecordIds,
    });

    return uniqueRecordIds.every((recordId) => admittedRecordIds.has(recordId));
  }

  async loadPermissionsMetadataMaps(
    workspaceId: string,
  ): Promise<PermissionsMetadataMaps> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
      featureFlagsMap,
      rolesPermissions,
      flatApplicationMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'featureFlagsMap',
      'rolesPermissions',
      'flatApplicationMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
    ]);

    return {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      featureFlagsMap,
      rolesPermissions,
      flatApplicationMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    };
  }

  // Event snapshots go through the same grant paths as the principal's queries
  buildEventRecordAccessGate({
    workspaceId,
    objectMetadata,
    events,
  }: WorkspaceEventBatch<ObjectRecordEvent>): EventRecordAccessGate {
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

      const uniqueRecordIds = [...new Set(recordIds)];
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

    return {
      resolveAdmittedRecordIds: async (principal) =>
        findPermissionsAdmittedRecordIds({
          principal,
          metadataMaps: await (metadataMaps ??=
            this.loadPermissionsMetadataMaps(workspaceId)),
          flatObjectMetadata: objectMetadata,
          operationType: 'select',
          records: resolveEventRecordSnapshots(events),
          context: {
            shouldIgnoreSoftDeleteDefaultFilter: true,
            fetchRecordShares,
            findPrivateRecordStates,
          },
        }),
    };
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
        transactionScope.getRepository(objectNameSingular, {
          shouldBypassPermissionChecks: true,
        }),
      );
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        work(
          this.workspaceOrmManager.getRepository(objectNameSingular, {
            shouldBypassPermissionChecks: true,
          }),
        ),
      buildSystemAuthContext(workspaceId),
    );
  }

  private findPrincipalMetadataMaps(
    principal: PermissionsPrincipal,
  ): Promise<PermissionsMetadataMaps> {
    const cachedMetadataMaps = this.metadataMapsByPrincipal.get(principal);

    if (isDefined(cachedMetadataMaps)) {
      return cachedMetadataMaps;
    }

    const metadataMaps = this.loadPermissionsMetadataMaps(
      principal.workspaceId,
    );

    this.metadataMapsByPrincipal.set(principal, metadataMaps);

    return metadataMaps;
  }

  private findSharedAccessLevelsByObjectMetadataId(
    principal: PermissionsPrincipal,
  ): Promise<Map<string, RecordShareAccessLevel[]>> {
    const cachedSharedAccessLevels =
      this.sharedAccessLevelsByPrincipal.get(principal);

    if (isDefined(cachedSharedAccessLevels)) {
      return cachedSharedAccessLevels;
    }

    const sharedAccessLevels =
      this.recordShareStorageService.findAccessLevelsByObjectMetadataId({
        workspaceId: principal.workspaceId,
        principalIds: getPermissionsPrincipalShareKeys(principal),
      });

    this.sharedAccessLevelsByPrincipal.set(principal, sharedAccessLevels);

    return sharedAccessLevels;
  }
}
