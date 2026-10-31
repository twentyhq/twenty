import { buildRecordShareLockKey } from 'src/engine/permissions/record-share/utils/build-record-share-lock-key.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { Injectable } from '@nestjs/common';

import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { NotFoundError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
  type RecordSharingGrantDTO,
  type RecordSharingRoleDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { RecordSharePrincipalService } from 'src/engine/permissions/record-share/services/record-share-principal.service';
import { type PrivateRecordState } from 'src/engine/permissions/private-record/types/private-record-state.type';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { canRolesAccessAllRecords } from 'src/engine/permissions/role/utils/can-roles-access-all-records.util';
import {
  type ObjectSharing,
  resolveObjectSharing,
} from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { assertPrivateRecordEnabledOrThrow } from 'src/engine/permissions/private-record/utils/assert-private-record-enabled-or-throw.util';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/permissions/record-share/utils/resolve-record-share-principal-or-throw.util';
import { resolveViewerRecordShareAccessLevel } from 'src/engine/permissions/record-share/utils/resolve-viewer-record-share-access-level.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/permissions/record-share/utils/validate-share-with-principals-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DENIED_RECORD_PERMISSIONS } from 'src/engine/permissions/record-permissions/constants/denied-record-permissions.constant';
import { type RecordPermissionsDTO } from 'src/engine/permissions/record-permissions/dtos/record-permissions.dto';
import { type RecordTargetInput } from 'src/engine/permissions/record-permissions/dtos/record-target.input';
import { RecordPermissionsService } from 'src/engine/permissions/record-permissions/services/record-permissions.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/permissions/principal/utils/get-role-ids-from-role-permission-config.util';
import { resolvePrincipalIdsFromAuthContext } from 'src/engine/permissions/principal/utils/resolve-principal-ids-from-auth-context.util';
import { resolveRolePermissionConfig } from 'src/engine/permissions/principal/utils/resolve-role-permission-config.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

type RecordSharingArgs = RecordTargetInput & {
  authContext: UserWorkspaceAuthContext;
};

type RecordSharingObject = ObjectSharing & {
  flatObjectMetadata: FlatObjectMetadata;
};

type RecordSharingChange = {
  workspaceId: string;
  transactionScope: WorkspaceTransactionScope;
  sharingObject: RecordSharingObject;
  creatorWorkspaceMemberId: string | undefined;
};

@Injectable()
export class RecordSharingService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordStorageService: PrivateRecordStorageService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly recordPermissionsService: RecordPermissionsService,
  ) {}

  async getSharing(args: RecordSharingArgs): Promise<RecordSharingDTO> {
    const sharingObject = await this.getSharingObject(args);
    const permissions = await this.getPermissions({ args, sharingObject });

    if (!permissions.canRead) {
      throw new NotFoundError('Record not found');
    }

    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  async setPrivate(
    args: RecordSharingArgs & { isPrivate: boolean },
  ): Promise<RecordSharingDTO> {
    return this.changeSharing(args, (change) =>
      this.writeRecordPrivacy({ ...change, args }),
    );
  }

  async setShare(
    args: RecordSharingArgs & {
      principal: RecordSharePrincipalInput;
      accessLevel: RecordShareAccessLevel;
    },
  ): Promise<RecordSharingDTO> {
    const maps = await this.workspaceCacheService.getOrRecompute(
      args.authContext.workspace.id,
      ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
    );
    const [principal] = validateShareWithPrincipalsOrThrow({
      shareWith: [{ ...args.principal, accessLevel: args.accessLevel }],
      ...maps,
    });

    return this.changeSharing(
      args,
      async ({ workspaceId, transactionScope, sharingObject }) => {
        await this.recordShareStorageService.setManualShare({
          workspaceId,
          transactionScope,
          enabled: true,
          share: {
            ...principal,
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            sourceId: args.recordId,
          },
        });
        await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow(
          {
            workspaceId,
            transactionScope,
            flatObjectMetadata: sharingObject.flatObjectMetadata,
            canShareBeyondRole: sharingObject.canShareBeyondRole,
            principals: [principal],
            recordIds: [args.recordId],
          },
        );
      },
    );
  }

  async removeShare(
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ): Promise<RecordSharingDTO> {
    const principal = resolveRecordSharePrincipalOrThrow(args.principal);

    return this.changeSharing(args, ({ workspaceId, transactionScope }) =>
      this.recordShareStorageService.setManualShare({
        workspaceId,
        transactionScope,
        enabled: false,
        share: {
          ...principal,
          accessLevel: RecordShareAccessLevel.READ,
          objectMetadataId: args.objectMetadataId,
          recordId: args.recordId,
          sourceId: args.recordId,
        },
      }),
    );
  }

  private async changeSharing(
    args: RecordSharingArgs,
    write: (change: RecordSharingChange) => Promise<void>,
  ): Promise<RecordSharingDTO> {
    const sharingObject = await this.getSharingObject(args);
    const { flatObjectMetadata } = sharingObject;
    const workspaceId = args.authContext.workspace.id;

    if (!sharingObject.isShareable) {
      throw new NotFoundError('Record not found');
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await transactionScope.executeRawQuery(
              'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
              [
                buildRecordShareLockKey({
                  workspaceId,
                  objectMetadataId: args.objectMetadataId,
                  recordId: args.recordId,
                }),
              ],
            );
            // Lock the target as well as its grants, so deletion cannot leave an orphan grant.
            await transactionScope.executeRawQuery(
              `SELECT id FROM ${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))} WHERE id = $1 FOR UPDATE`,
              [args.recordId],
            );
            const repository =
              this.workspaceOrmManager.getRepositoryWithContextPermissions(
                flatObjectMetadata.nameSingular,
                transactionScope,
              );
            const writableIds =
              await repository.findRecordIdsAllowedForOperation({
                recordIds: [args.recordId],
                operationType: 'update',
                withDeleted: true,
              });
            // A grant may let someone edit a record beyond their role, never
            // decide who else gets it
            if (
              writableIds.length !== 1 ||
              !repository.isObjectOperationPermittedByRole('update')
            ) {
              throw new NotFoundError('Record not found');
            }
            const { viewerAccessLevel, creatorWorkspaceMemberId } =
              await this.getRecordShares({
                ...args,
                sharingObject,
                transactionScope,
              });
            if (viewerAccessLevel !== RecordShareAccessLevel.FULL) {
              throw new NotFoundError('Record not found');
            }
            await write({
              workspaceId,
              transactionScope,
              sharingObject,
              creatorWorkspaceMemberId,
            });
          },
        ),
      args.authContext,
    );

    const permissions = await this.getPermissions({ args, sharingObject });

    // A writer may revoke their own access; the mutation must still succeed with a redacted state.
    if (!permissions.canRead) {
      return {
        isShareable: sharingObject.isShareable,
        isPrivate: false,
        canManageSharing: false,
        permissions,
        hasManagedGeneralAccess: false,
        roles: [],
        shares: [],
      };
    }

    return this.buildSharingResponse({ args, sharingObject, permissions });
  }

  private async writeRecordPrivacy({
    workspaceId,
    transactionScope,
    sharingObject: { flatObjectMetadata },
    creatorWorkspaceMemberId,
    args,
  }: RecordSharingChange & {
    args: RecordSharingArgs & { isPrivate: boolean };
  }): Promise<void> {
    const { isPrivate } = args;
    const { featureFlagsMap, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
        'flatFieldMetadataMaps',
      ]);

    if (isPrivate) {
      assertPrivateRecordEnabledOrThrow(featureFlagsMap);
    }

    await this.privateRecordStorageService.setPrivate({
      workspaceId,
      flatObjectMetadata,
      recordIds: [args.recordId],
      isPrivate,
      transactionScope,
    });

    // An owner row, unlike a share, survives the share removals of whoever made the record private
    if (!isPrivate) {
      if (!hasCreatedByField({ flatObjectMetadata, flatFieldMetadataMaps })) {
        return;
      }

      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        transactionScope,
        criteria: [
          {
            objectMetadataId: args.objectMetadataId,
            recordId: args.recordId,
            rowCause: RecordShareRowCause.OWNER,
          },
        ],
      });

      return;
    }

    await this.recordShareStorageService.deleteMatching({
      workspaceId,
      transactionScope,
      criteria: [
        {
          objectMetadataId: args.objectMetadataId,
          recordId: args.recordId,
          principalType: RecordSharePrincipalType.EVERYONE,
          rowCause: RecordShareRowCause.MANUAL,
        },
      ],
    });

    if (args.authContext.workspaceMemberId === creatorWorkspaceMemberId) {
      return;
    }

    await this.recordShareStorageService.insertMany({
      workspaceId,
      transactionScope,
      recordShares: [
        {
          recordId: args.recordId,
          objectMetadataId: args.objectMetadataId,
          principalId: args.authContext.workspaceMemberId,
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          accessLevel: RecordShareAccessLevel.FULL,
          rowCause: RecordShareRowCause.OWNER,
          sourceId: args.recordId,
        },
      ],
    });
  }

  private async buildSharingResponse({
    args,
    sharingObject,
    permissions,
  }: {
    args: RecordSharingArgs;
    sharingObject: RecordSharingObject;
    permissions: RecordPermissionsDTO;
  }): Promise<RecordSharingDTO> {
    const { flatObjectMetadata } = sharingObject;
    const { shares, viewerAccessLevel, isPrivate } = await this.getRecordShares(
      { ...args, sharingObject },
    );
    const canManageSharing =
      sharingObject.isShareable &&
      permissions.canUpdate &&
      viewerAccessLevel === RecordShareAccessLevel.FULL &&
      (await this.isUpdatePermittedByRole({
        authContext: args.authContext,
        flatObjectMetadata,
      }));
    const grants = shares.filter(
      (share) =>
        share.principalType !== RecordSharePrincipalType.EVERYONE &&
        share.accessLevel !== RecordShareAccessLevel.NONE,
    );

    return {
      isShareable: sharingObject.isShareable,
      isPrivate,
      canManageSharing,
      permissions,
      hasManagedGeneralAccess: shares.some(
        (share) =>
          share.principalType === RecordSharePrincipalType.EVERYONE &&
          share.rowCause !== RecordShareRowCause.MANUAL &&
          share.accessLevel !== RecordShareAccessLevel.NONE,
      ),
      shares: canManageSharing
        ? await this.buildGrants({
            workspaceId: args.authContext.workspace.id,
            grants,
          })
        : [],
      roles: canManageSharing
        ? await this.buildRoles({
            workspaceId: args.authContext.workspace.id,
            objectMetadataId: flatObjectMetadata.id,
            grants,
          })
        : [],
    };
  }

  private async buildGrants({
    workspaceId,
    grants,
  }: {
    workspaceId: string;
    grants: RecordShare[];
  }): Promise<RecordSharingGrantDTO[]> {
    const roleIds = await this.recordSharePrincipalService.resolveRoleIds({
      workspaceId,
      principals: grants,
    });

    return grants.map((grant, index) => ({
      id: grant.id,
      principalType: grant.principalType,
      principalId: grant.principalId,
      principalRoleId:
        grant.principalType === RecordSharePrincipalType.WORKSPACE_MEMBER
          ? (roleIds[index] ?? null)
          : null,
      accessLevel: grant.accessLevel,
      rowCause: grant.rowCause,
    }));
  }

  private async buildRoles({
    workspaceId,
    objectMetadataId,
    grants,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    grants: RecordShare[];
  }): Promise<RecordSharingRoleDTO[]> {
    const { flatRoleMaps, rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleMaps',
        'rolesPermissions',
      ]);

    return Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(
        (role) =>
          role.canBeAssignedToUsers ||
          grants.some(
            (grant) =>
              grant.principalType === RecordSharePrincipalType.ROLE &&
              grant.principalId === role.id,
          ),
      )
      .map(({ id, label }) => {
        const roleObjectsPermissions = rolesPermissions[id];

        if (!isDefined(roleObjectsPermissions)) {
          return { id, label, canRead: null, canUpdate: null };
        }

        const objectPermissions = roleObjectsPermissions[objectMetadataId];

        return {
          id,
          label,
          canRead: objectPermissions?.canReadObjectRecords ?? false,
          canUpdate: objectPermissions?.canUpdateObjectRecords ?? false,
        };
      });
  }

  private async getRecordShares({
    authContext,
    objectMetadataId,
    recordId,
    sharingObject,
    transactionScope,
  }: RecordSharingArgs & {
    sharingObject: RecordSharingObject;
    transactionScope?: WorkspaceTransactionScope;
  }) {
    const workspaceId = authContext.workspace.id;
    const { flatObjectMetadata, isShareable } = sharingObject;
    const {
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
      roleIdsWithAllRecordsAccess,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'userWorkspaceRoleMap',
      'apiKeyRoleMap',
      'flatRoleTargetByAgentIdMaps',
      'roleIdsWithAllRecordsAccess',
    ]);
    const roleMaps = {
      authContext,
      userWorkspaceRoleMap,
      apiKeyRoleMap,
      flatRoleTargetByAgentIdMaps,
    };
    const principalIds = resolvePrincipalIdsFromAuthContext(roleMaps) ?? [];
    const rolePermissionConfig = resolveRolePermissionConfig(roleMaps);
    const canAccessAllRecords =
      isDefined(rolePermissionConfig) &&
      canRolesAccessAllRecords({
        roleIds: getRoleIdsFromRolePermissionConfig(rolePermissionConfig),
        roleIdsWithAllRecordsAccess,
      });
    const shares = await this.recordShareStorageService.findByRecordIds({
      workspaceId,
      objectMetadataId,
      recordIds: [recordId],
      transactionScope,
    });
    const privateRecordState = await this.findPrivateRecordState({
      workspaceId,
      flatObjectMetadata,
      recordId,
      transactionScope,
    });

    const isPrivate = privateRecordState?.isPrivate ?? false;
    const creatorWorkspaceMemberId =
      privateRecordState?.createdByWorkspaceMemberId ?? undefined;
    const viewerAccessLevel = resolveViewerRecordShareAccessLevel({
      recordShares: shares,
      principalIds,
      implicitAccessLevels: isShareable
        ? [
            isPrivate ? null : RecordShareAccessLevel.READ_WRITE,
            creatorWorkspaceMemberId === authContext.workspaceMemberId ||
            (canAccessAllRecords && !isPrivate)
              ? RecordShareAccessLevel.FULL
              : null,
          ]
        : [],
    });

    return {
      shares,
      viewerAccessLevel,
      isPrivate,
      creatorWorkspaceMemberId,
    };
  }

  private async findPrivateRecordState({
    workspaceId,
    flatObjectMetadata,
    recordId,
    transactionScope,
  }: {
    workspaceId: string;
    flatObjectMetadata: FlatObjectMetadata;
    recordId: string;
    transactionScope?: WorkspaceTransactionScope;
  }): Promise<PrivateRecordState | undefined> {
    const privateRecordStates =
      await this.privateRecordStorageService.findStates({
        workspaceId,
        flatObjectMetadata,
        recordIds: [recordId],
        transactionScope,
      });

    return privateRecordStates.get(recordId);
  }

  private async getPermissions({
    args,
    sharingObject,
  }: {
    args: RecordSharingArgs;
    sharingObject: RecordSharingObject;
  }): Promise<RecordPermissionsDTO> {
    const permissionsByRecordId =
      await this.recordPermissionsService.getPermissionsForRecords({
        authContext: args.authContext,
        flatObjectMetadata: sharingObject.flatObjectMetadata,
        recordIds: [args.recordId],
      });

    return (
      permissionsByRecordId.get(args.recordId) ?? DENIED_RECORD_PERMISSIONS
    );
  }

  private isUpdatePermittedByRole({
    authContext,
    flatObjectMetadata,
  }: Pick<RecordSharingArgs, 'authContext'> & {
    flatObjectMetadata: Pick<FlatObjectMetadata, 'nameSingular'>;
  }): Promise<boolean> {
    return this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager
          .getRepositoryWithContextPermissions(flatObjectMetadata.nameSingular)
          .isObjectOperationPermittedByRole('update'),
      authContext,
    );
  }

  private async getSharingObject({
    authContext,
    objectMetadataId,
  }: Pick<
    RecordSharingArgs,
    'authContext' | 'objectMetadataId'
  >): Promise<RecordSharingObject> {
    const { flatObjectMetadataMaps, featureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps', 'featureFlagsMap'],
      );
    const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      throw new NotFoundError('Record not found');
    }

    return {
      flatObjectMetadata,
      ...resolveObjectSharing({ flatObjectMetadata, featureFlagsMap }),
    };
  }
}
