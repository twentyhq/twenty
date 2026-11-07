/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import {
  FeatureFlagKey,
  type RecordShareAccessLevel,
  type RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { UserWorkspaceSuccessorService } from 'src/engine/core-modules/user-workspace/services/user-workspace-successor.service';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PrivateRecordWriteService } from 'src/engine/permissions/internal/private-record/services/private-record-write.service';
import { RecordPermissionReadRepository } from 'src/engine/permissions/internal/record-permission-repository/repositories/record-permission-read.repository';
import { type RuleRecordSharesScope } from 'src/engine/permissions/internal/record-permission-repository/utils/build-find-rule-record-shares-query.util';
import { RecordShareStorageService } from 'src/engine/permissions/internal/record-share/services/record-share-storage.service';
import { diffRuleRecordShares } from 'src/engine/permissions/internal/record-share/utils/diff-rule-record-shares.util';
import { type RuleRecordShareGrant } from 'src/engine/permissions/record-share/types/rule-record-share-grant.type';
import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { type RecordPermissionTransactionScope } from 'src/engine/permissions/types/record-permission-transaction-scope.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// These writes don't check any caller, so the calling code is responsible
@Injectable()
export class RecordShareSystemWriteService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareStorageService: RecordShareStorageService,
    private readonly privateRecordWriteService: PrivateRecordWriteService,
    private readonly recordPermissionReadRepository: RecordPermissionReadRepository,
    private readonly userWorkspaceSuccessorService: UserWorkspaceSuccessorService,
  ) {}

  setRecordsPrivacy(
    args: Parameters<PrivateRecordWriteService['setPrivateOrThrow']>[0],
  ): Promise<void> {
    return this.privateRecordWriteService.setPrivateOrThrow(args);
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
        await this.recordPermissionReadRepository.findRuleRecordShares({
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
      await this.userWorkspaceSuccessorService.findSuccessorUserWorkspace({
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
