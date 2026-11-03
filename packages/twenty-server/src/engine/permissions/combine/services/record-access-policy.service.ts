/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import groupBy from 'lodash.groupby';
import { type ObjectRecordEvent } from 'twenty-shared/database-events';
import {
  type ObjectsPermissions,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/permissions/permissions.exception';
import { getPermissionsPrincipalObjectsPermissions } from 'src/engine/permissions/role/utils/get-permissions-principal-objects-permissions.util';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type EventRecordAccessGate } from 'src/engine/permissions/combine/types/event-record-access-gate.type';
import {
  type PermissionsMetadataMaps,
  type PermissionsObjectAccessRequest,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsContext } from 'src/engine/permissions/principal/types/permissions-principals-context.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { resolvePermissionsPrincipalsWithRoles } from 'src/engine/permissions/principal/utils/resolve-permissions-principals-with-roles.util';
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
import { findPermissionsAdmittedRecordIds } from 'src/engine/permissions/combine/utils/find-permissions-admitted-record-ids.util';
import { resolveEventRecordSnapshots } from 'src/engine/permissions/combine/utils/resolve-event-record-snapshots.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

type PrincipalsAccessRequest = Omit<
  PermissionsObjectAccessRequest,
  'principal' | 'metadataMaps'
> & { principals: PermissionsPrincipalsContext };

const EMPTY_WORKSPACE_MEMBER_MAPS = { byId: {}, userWorkspaceIdByUserId: {} };

@Injectable()
export class RecordAccessPolicyService {
  private readonly principalsWithRolesByPrincipals = new WeakMap<
    PermissionsPrincipalsContext,
    Promise<PermissionsPrincipalsWithRolesContext | undefined>
  >();

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
  ) {}

  // Shares only count once a row exists, so an object reached by nothing stays out of reach
  async hasAccessToSomeRecords({
    principals,
    flatObjectMetadata,
    operationType,
  }: PrincipalsAccessRequest): Promise<boolean> {
    const principal = await this.findPrincipalsWithRoles(principals);

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

  async hasAccessToRecords({
    principals,
    flatObjectMetadata,
    operationType,
    recordIds,
    hypotheticalRecordShareAccessLevel,
    transactionScope,
  }: PrincipalsAccessRequest & {
    recordIds: string[];
    hypotheticalRecordShareAccessLevel?: RecordShareAccessLevel;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<boolean> {
    const uniqueRecordIds = [
      ...new Set(recordIds.map((recordId) => recordId.toLowerCase())),
    ];
    const principal = await this.findPrincipalsWithRoles(principals);

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
    principals: PermissionsPrincipalsContext,
  ): Promise<ObjectsPermissions> {
    const objectsPermissions = await this.findObjectsPermissions(principals);

    if (!isDefined(objectsPermissions)) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    return objectsPermissions;
  }

  // undefined when the principals hold no role
  async findObjectsPermissions(
    principals: PermissionsPrincipalsContext,
  ): Promise<ObjectsPermissions | undefined> {
    const principal = await this.findPrincipalsWithRoles(principals);

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

    return {
      resolveAdmittedRecordIds: async (principals) => {
        const principal = await this.findPrincipalsWithRoles(principals);

        if (!isDefined(principal)) {
          return new Set<string>();
        }

        return findPermissionsAdmittedRecordIds({
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

  private findPrincipalsWithRoles(
    principals: PermissionsPrincipalsContext,
  ): Promise<PermissionsPrincipalsWithRolesContext | undefined> {
    const cachedPrincipalsWithRoles =
      this.principalsWithRolesByPrincipals.get(principals);

    if (isDefined(cachedPrincipalsWithRoles)) {
      return cachedPrincipalsWithRoles;
    }

    const principalsWithRoles = this.resolvePrincipalsWithRoles(principals);

    this.principalsWithRolesByPrincipals.set(principals, principalsWithRoles);

    return principalsWithRoles;
  }

  private async resolvePrincipalsWithRoles(
    principals: PermissionsPrincipalsContext,
  ): Promise<PermissionsPrincipalsWithRolesContext | undefined> {
    const { mainPrincipal, workspaceId } = principals;
    const {
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
      flatApplicationMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRoleTargetByAgentIdMaps',
      'flatApplicationMaps',
    ]);
    const { flatWorkspaceMemberMaps } =
      mainPrincipal.type === 'workspaceMember'
        ? await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatWorkspaceMemberMaps',
          ])
        : { flatWorkspaceMemberMaps: EMPTY_WORKSPACE_MEMBER_MAPS };
    const { flatRoleTargetMaps } =
      mainPrincipal.type === 'webhook'
        ? await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatRoleTargetMaps',
          ])
        : { flatRoleTargetMaps: undefined };

    return resolvePermissionsPrincipalsWithRoles({
      principalsContext: principals,
      roleMaps: {
        flatWorkspaceMemberMaps,
        userWorkspaceRoleMap,
        apiKeyRoleMap,
        flatRoleTargetByAgentIdMaps,
        flatApplicationMaps,
        flatRoleTargetMaps,
      },
    });
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
