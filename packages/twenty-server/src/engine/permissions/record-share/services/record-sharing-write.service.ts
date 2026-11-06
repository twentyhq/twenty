/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  RecordShareAccessLevel,
  type RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PrivateRecordWriteService } from 'src/engine/permissions/internal/private-record/services/private-record-write.service';
import { RecordPermissionReadOrmService } from 'src/engine/permissions/internal/record-permission-orm/services/record-permission-read-orm.service';
import { type RuleRecordSharesScope } from 'src/engine/permissions/internal/record-permission-orm/utils/build-find-rule-record-shares-query.util';
import { RecordSharePrincipalService } from 'src/engine/permissions/internal/record-share/services/record-share-principal.service';
import { RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import { RecordSharingChangeService } from 'src/engine/permissions/internal/record-share/services/record-sharing-change.service';
import { buildRecordShareInputsForCreatedRecords } from 'src/engine/permissions/internal/record-share/utils/build-record-share-inputs-for-created-records.util';
import { diffRuleRecordShares } from 'src/engine/permissions/internal/record-share/utils/diff-rule-record-shares.util';
import { resolveRecordSharePrincipalOrThrow } from 'src/engine/permissions/internal/record-share/utils/resolve-record-share-principal-or-throw.util';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/permissions/internal/record-share/utils/resolve-share-with-principal-or-throw.util';
import { validateShareWithArgOrThrow } from 'src/engine/permissions/internal/record-share/utils/validate-share-with-arg-or-throw.util';
import { validateShareWithPrincipalsOrThrow } from 'src/engine/permissions/internal/record-share/utils/validate-share-with-principals-or-throw.util';
import {
  type RecordSharePrincipalInput,
  type RecordSharingDTO,
} from 'src/engine/permissions/record-share/dtos/record-sharing.dto';
import { type RecordSharingArgs } from 'src/engine/permissions/record-share/types/record-sharing-args.type';
import { type RuleRecordShareGrant } from 'src/engine/permissions/record-share/types/rule-record-share-grant.type';
import { type ShareWithInput } from 'src/engine/permissions/record-share/types/share-with-input.type';
import { type CreatedRecordSharing } from 'src/engine/permissions/record-share/utils/resolve-created-record-sharing-or-throw.util';
import {
  type ObjectSharing,
  resolveObjectSharing,
} from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { RolePermissionsService } from 'src/engine/permissions/role-permissions.service';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class RecordSharingWriteService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly recordSharingChangeService: RecordSharingChangeService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly privateRecordWriteService: PrivateRecordWriteService,
    private readonly recordPermissionReadOrmService: RecordPermissionReadOrmService,
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}

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

    return this.recordSharingChangeService.runChange({
      args,
      write: async ({ workspaceId, transactionScope, sharingObject }) => {
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
    });
  }

  async removeShare(
    args: RecordSharingArgs & { principal: RecordSharePrincipalInput },
  ): Promise<RecordSharingDTO> {
    const principal = resolveRecordSharePrincipalOrThrow(args.principal);

    return this.recordSharingChangeService.runChange({
      args,
      write: ({ workspaceId, transactionScope }) =>
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
    });
  }

  changeRecordPrivacy(
    args: RecordSharingArgs & { isPrivate: boolean },
  ): Promise<RecordSharingDTO> {
    return this.privateRecordWriteService.changeRecordPrivacy(args);
  }

  setRecordsPrivate(
    args: Parameters<PrivateRecordWriteService['setPrivate']>[0],
  ): Promise<void> {
    return this.privateRecordWriteService.setPrivate(args);
  }

  async validateShareWithOrThrow({
    authContext,
    shareWith,
  }: {
    authContext: WorkspaceAuthContext;
    shareWith?: ShareWithInput[] | null;
  }): Promise<void> {
    validateShareWithArgOrThrow({
      authContext,
      shareWith,
    });

    if (!isNonEmptyArray(shareWith)) {
      return;
    }

    const { flatWorkspaceMemberMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatWorkspaceMemberMaps', 'flatRoleMaps'],
      );

    validateShareWithPrincipalsOrThrow({
      shareWith,
      flatWorkspaceMemberMaps,
      flatRoleMaps,
    });
  }

  async insertRecordSharesForCreatedRecords({
    authContext,
    flatObjectMetadata,
    objectSharing,
    recordIds,
    createdRecordSharing: { shareWith, isPrivate },
    transactionScope,
  }: {
    authContext: WorkspaceAuthContext;
    flatObjectMetadata: FlatObjectMetadata;
    objectSharing: ObjectSharing;
    recordIds: string[];
    createdRecordSharing: CreatedRecordSharing;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const workspaceId = authContext.workspace.id;

    // A hard-destroyed record leaves its rows behind, and a client may reuse its id
    await this.recordShareStorageService.deleteByRecordIds({
      workspaceId,
      objectMetadataId: flatObjectMetadata.id,
      recordIds,
      transactionScope,
    });

    const { apiKeyRoleMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['apiKeyRoleMap'],
    );

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildRecordShareInputsForCreatedRecords({
        recordIds,
        objectMetadataId: flatObjectMetadata.id,
        authContext,
        apiKeyRoleMap,
        shareWith,
        isPrivateByDefault: objectSharing.isPrivateByDefault,
        isPrivate,
      }),
      transactionScope,
    });

    if (isPrivate) {
      await this.privateRecordWriteService.setPrivate({
        workspaceId,
        flatObjectMetadata,
        recordIds,
        isPrivate: true,
        transactionScope,
      });
    }

    await this.recordSharePrincipalService.assertPrincipalsReachRecordsOrThrow({
      workspaceId,
      transactionScope,
      flatObjectMetadata,
      canShareBeyondRole: objectSharing.canShareBeyondRole,
      principals: shareWith.map(resolveShareWithPrincipalOrThrow),
      recordIds,
    });
  }

  // Every path removing a member from an active workspace must call this, or only all-records roles can manage their records
  async transferRecordSharesToSuccessor({
    removedUserWorkspace,
    removedWorkspaceMemberId,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    removedWorkspaceMemberId: string;
    actingUserWorkspaceId?: string;
  }): Promise<void> {
    const { workspaceId } = removedUserWorkspace;
    const transferableObjects = await this.findTransferableObjects(workspaceId);

    if (transferableObjects.length === 0) {
      return;
    }

    const toWorkspaceMemberId = await this.resolveSuccessorWorkspaceMemberId({
      removedUserWorkspace,
      actingUserWorkspaceId,
    });

    await this.recordShareStorageService.transferMemberGrants({
      workspaceId,
      objectMetadataIds: transferableObjects.map(({ id }) => id),
      fromWorkspaceMemberId: removedWorkspaceMemberId,
      toWorkspaceMemberId,
    });

    if (isDefined(toWorkspaceMemberId)) {
      // Nobody passes the creator check of a removed member's private records, admins included
      await this.privateRecordWriteService.grantPrivateRecordsCreatedBy({
        workspaceId,
        flatObjectMetadatas: transferableObjects,
        creatorWorkspaceMemberId: removedWorkspaceMemberId,
        granteeWorkspaceMemberId: toWorkspaceMemberId,
      });
    }
  }

  // Deletes RULE rows no grant asks for, so the caller must own every RULE row in the scope
  async syncRuleRecordShares({
    workspaceId,
    objectMetadataId,
    scope,
    ruleGrants,
    principalType,
    accessLevel,
    transactionScope,
  }: {
    workspaceId: string;
    objectMetadataId: string;
    scope: RuleRecordSharesScope;
    ruleGrants: RuleRecordShareGrant[];
    principalType: RecordSharePrincipalType;
    accessLevel: RecordShareAccessLevel;
    transactionScope: RecordPermissionTransactionScope;
  }): Promise<void> {
    const { obsoleteRecordShareIds, missingGrants } = diffRuleRecordShares({
      ruleGrants,
      existingRuleRecordShares:
        await this.recordPermissionReadOrmService.findRuleRecordShares({
          workspaceId,
          objectMetadataId,
          scope,
          transactionScope,
        }),
    });

    if (isNonEmptyArray(obsoleteRecordShareIds)) {
      await this.recordShareStorageService.deleteMatching({
        workspaceId,
        criteria: { ids: obsoleteRecordShareIds },
        transactionScope,
      });
    }

    for (const missingGrantBatch of chunk(missingGrants, QUERY_MAX_RECORDS)) {
      await this.recordShareStorageService.insertMany({
        workspaceId,
        recordShares: missingGrantBatch.map((missingGrant) => ({
          ...missingGrant,
          objectMetadataId,
          principalType,
          accessLevel,
          rowCause: RecordShareRowCause.RULE,
        })),
        transactionScope,
      });
    }
  }

  insertRecordShares(
    args: Parameters<RecordShareStorageService['insertMany']>[0],
  ): Promise<void> {
    return this.recordShareStorageService.insertMany(args);
  }

  deleteRecordSharesByRecordIds(
    args: Parameters<RecordShareStorageService['deleteByRecordIds']>[0],
  ): Promise<void> {
    return this.recordShareStorageService.deleteByRecordIds(args);
  }

  private async findTransferableObjects(
    workspaceId: string,
  ): Promise<FlatObjectMetadata[]> {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    return (
      Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        // Rows written while sharing was enabled still need a successor
        .filter((flatObjectMetadata) => {
          const { isShareable, isPrivateByDefault } = resolveObjectSharing({
            flatObjectMetadata,
            featureFlagsMap: {
              [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
            },
          });

          return isShareable && !isPrivateByDefault;
        })
    );
  }

  private async resolveSuccessorWorkspaceMemberId({
    removedUserWorkspace,
    actingUserWorkspaceId,
  }: {
    removedUserWorkspace: UserWorkspaceEntity;
    actingUserWorkspaceId?: string;
  }): Promise<string | undefined> {
    const successorUserWorkspace =
      await this.rolePermissionsService.findSuccessorUserWorkspace({
        removedUserWorkspace,
        actingUserWorkspaceId,
      });

    if (!isDefined(successorUserWorkspace)) {
      return undefined;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(
        removedUserWorkspace.workspaceId,
        ['flatWorkspaceMemberMaps'],
      );

    // The cache keeps soft-deleted members, so idByUserId may point at one
    const successorWorkspaceMember = Object.values(
      flatWorkspaceMemberMaps.byId,
    ).find(
      (workspaceMember) =>
        isDefined(workspaceMember) &&
        workspaceMember.userId === successorUserWorkspace.userId &&
        !isDefined(workspaceMember.deletedAt),
    );

    return successorWorkspaceMember?.id;
  }
}
