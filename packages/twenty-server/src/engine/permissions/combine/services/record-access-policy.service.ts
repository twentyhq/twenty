/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectsPermissions,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import { getPermissionsPrincipalObjectsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principal-objects-permissions.util';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';
import { getPermissionsPrincipalShareKeys } from 'src/engine/permissions/principal/utils/get-permissions-principal-share-keys.util';
import { resolvePermissionsShareGrant } from 'src/engine/permissions/record-share/utils/resolve-permissions-share-grant.util';
import { isObjectOperationDeniedToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-denied-to-principal.util';
import { isObjectOperationDisabledToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-disabled-to-principal.util';
import { hasWorkspaceMemberBoundPredicates } from 'src/engine/permissions/rls/utils/has-workspace-member-bound-predicates.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { filterReadableEvents } from 'src/engine/permissions/combine/utils/filter-readable-events.util';
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-snapshots.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type ObjectAccessRequest = Omit<
  PermissionsObjectAccessRequest,
  'principal' | 'metadataMaps'
>;

type AuthContextAccessRequest = ObjectAccessRequest & {
  authContext: PermissionsAuthContext;
};

type RecordsAccessRequest = ObjectAccessRequest & {
  recordIds: string[];
  hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
  transactionScope?: WorkspaceTransactionScope;
};

type PrincipalWithRoles = Promise<
  PermissionsPrincipalsWithRolesContext | undefined
>;

export type ScopedRecordAccessPolicy = {
  hasAccessToSomeRecords: (request: ObjectAccessRequest) => Promise<boolean>;
  hasAccessToRecords: (request: RecordsAccessRequest) => Promise<boolean>;
  findObjectsPermissions: () => Promise<ObjectsPermissions | undefined>;
};

@Injectable()
export class RecordAccessPolicyService {
  private readonly metadataMapsByPrincipal = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<PermissionsMetadataMaps>
  >();

  private readonly sharedAccessLevelsByPrincipal = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<Map<string, RecordShareAccessLevel[]>>
  >();

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly permissionsService: PermissionsService,
  ) {}

  forAuthContext(
    authContext: PermissionsAuthContext,
  ): ScopedRecordAccessPolicy {
    const principal = this.resolvePrincipalsWithRoles(authContext);

    return {
      hasAccessToSomeRecords: (request) =>
        this.hasPrincipalAccessToSomeRecords({ ...request, principal }),
      hasAccessToRecords: (request) =>
        this.hasPrincipalAccessToRecords({ ...request, principal }),
      findObjectsPermissions: () =>
        this.findPrincipalObjectsPermissions(principal),
    };
  }

  async hasAccessToSomeRecords({
    authContext,
    ...request
  }: AuthContextAccessRequest): Promise<boolean> {
    return this.hasPrincipalAccessToSomeRecords({
      ...request,
      principal: this.resolvePrincipalsWithRoles(authContext),
    });
  }

  async hasAccessToRecords({
    authContext,
    ...request
  }: AuthContextAccessRequest & RecordsAccessRequest): Promise<boolean> {
    return this.hasPrincipalAccessToRecords({
      ...request,
      principal: this.resolvePrincipalsWithRoles(authContext),
    });
  }

  // Shares only count once a row exists, so an object reached by nothing stays out of reach
  private async hasPrincipalAccessToSomeRecords({
    principal: principalWithRoles,
    flatObjectMetadata,
    operationType,
  }: Pick<ObjectAccessRequest, 'flatObjectMetadata' | 'operationType'> & {
    principal: PrincipalWithRoles;
  }): Promise<boolean> {
    const principal = await principalWithRoles;

    if (!isDefined(principal)) {
      return false;
    }

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

  private async hasPrincipalAccessToRecords({
    principal: principalWithRoles,
    flatObjectMetadata,
    operationType,
    recordIds,
    hypotheticalRecordShareAccessLevel,
    transactionScope,
  }: RecordsAccessRequest & {
    principal: PrincipalWithRoles;
  }): Promise<boolean> {
    const uniqueRecordIds = [
      ...new Set(recordIds.map((recordId) => recordId.toLowerCase())),
    ];
    const principal = await principalWithRoles;

    if (uniqueRecordIds.length === 0 || !isDefined(principal)) {
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

  async getObjectsPermissionsOrThrow(
    authContext: PermissionsAuthContext,
  ): Promise<ObjectsPermissions> {
    const objectsPermissions = await this.findObjectsPermissions(authContext);

    if (!isDefined(objectsPermissions)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return objectsPermissions;
  }

  async findObjectsPermissions(
    authContext: PermissionsAuthContext,
  ): Promise<ObjectsPermissions | undefined> {
    return this.findPrincipalObjectsPermissions(
      this.resolvePrincipalsWithRoles(authContext),
    );
  }

  private async findPrincipalObjectsPermissions(
    principalWithRoles: PrincipalWithRoles,
  ): Promise<ObjectsPermissions | undefined> {
    const principal = await principalWithRoles;

    if (!isDefined(principal)) {
      return undefined;
    }

    return getPermissionsPrincipalObjectsPermissions({
      principal,
      metadataMaps: await this.findPrincipalMetadataMaps(principal),
    });
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

    const metadataMaps: PermissionsMetadataMaps = {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      featureFlagsMap,
      rolesPermissions,
      flatApplicationMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    };

    if (
      !hasWorkspaceMemberBoundPredicates(flatRowLevelPermissionPredicateMaps)
    ) {
      return metadataMaps;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    return { ...metadataMaps, flatWorkspaceMemberMaps };
  }

  // Event snapshots go through the same grant paths as the principal's queries
  buildEventRecordAccessGate<TEvent extends ObjectRecordEvent>({
    workspaceId,
    objectMetadata,
    events,
  }: WorkspaceEventBatch<TEvent>): EventRecordAccessGate<TEvent> {
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
      (metadataMaps ??= this.loadPermissionsMetadataMaps(workspaceId));

    const findAdmittedRecordIds = async (
      principal: PermissionsPrincipalsWithRolesContext,
    ) =>
      findPermissionsAdmittedRecordIds({
        principal,
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

    return {
      resolveAdmittedRecordIds: async (authContext) => {
        const principal = await this.resolvePrincipalsWithRoles(authContext);

        return isDefined(principal)
          ? findAdmittedRecordIds(principal)
          : new Set<string>();
      },
      resolveReadableEvents: async ({
        authContext,
        events: candidateEvents,
      }) => {
        const principal = await this.resolvePrincipalsWithRoles(authContext);

        if (!isDefined(principal)) {
          return [];
        }

        const principalMetadataMaps = await loadMetadataMaps();

        // A role missing from the cache must not fall through to share or creator admission
        if (
          getPermissionsPrincipalRoleIds(principal).some(
            (roleId) =>
              !isDefined(principalMetadataMaps.rolesPermissions[roleId]),
          )
        ) {
          return [];
        }

        return filterReadableEvents({
          events: candidateEvents,
          admittedRecordIds: await findAdmittedRecordIds(principal),
          objectMetadata,
          objectsPermissions: getPermissionsPrincipalObjectsPermissions({
            principal,
            metadataMaps: principalMetadataMaps,
          }),
          metadataMaps: principalMetadataMaps,
        });
      },
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
    return this.permissionsService.findPrincipalWithRoles(authContext);
  }

  private findPrincipalMetadataMaps(
    principal: PermissionsPrincipalsWithRolesContext,
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
    principal: PermissionsPrincipalsWithRolesContext,
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
