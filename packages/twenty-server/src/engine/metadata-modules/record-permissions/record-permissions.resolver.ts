import { UseGuards } from '@nestjs/common';
import { Args, Query } from '@nestjs/graphql';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { getWorkspaceAuthContext } from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import {
  AuthenticationError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { type RecordPermissionsDTO } from 'src/engine/core-modules/record-share/dtos/record-permissions.dto';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import {
  RecordPermissionsResult,
  RecordPermissionsTargetInput,
} from 'src/engine/metadata-modules/record-permissions/dtos/record-permissions-result.dto';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const MAX_PERMISSION_TARGETS = 100;

@MetadataResolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard, CustomPermissionGuard)
export class RecordPermissionsResolver {
  constructor(
    private readonly recordSharingService: RecordSharingService,
    private readonly agentChatSharingService: AgentChatSharingService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Query(() => [RecordPermissionsResult])
  async recordPermissions(
    @Args('targets', { type: () => [RecordPermissionsTargetInput] })
    targets: RecordPermissionsTargetInput[],
  ): Promise<RecordPermissionsResult[]> {
    const authContext = getWorkspaceAuthContext();
    if (!isUserAuthContext(authContext)) {
      throw new AuthenticationError('User authentication required');
    }
    if (targets.length > MAX_PERMISSION_TARGETS) {
      throw new UserInputError('Too many permission targets');
    }
    if (targets.length === 0) {
      return [];
    }
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(
        authContext.workspace.id,
        ['flatObjectMetadataMaps'],
      );
    const recordIdsByObjectId = new Map<string, Set<string>>();
    for (const target of targets) {
      const recordIds =
        recordIdsByObjectId.get(target.objectMetadataId) ?? new Set<string>();
      recordIds.add(target.recordId);
      recordIdsByObjectId.set(target.objectMetadataId, recordIds);
    }
    const results: RecordPermissionsResult[] = [];
    for (const [objectMetadataId, recordIds] of recordIdsByObjectId) {
      const objectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });
      const denied = {
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canSoftDelete: false,
      };
      // Older workspaces keep chat history owner-only until the sharing upgrade
      // installs grants. Reuse that compatibility policy during rolling deploys.
      const isLegacyChat =
        objectMetadata?.universalIdentifier ===
          STANDARD_OBJECTS.agentChatThread.universalIdentifier &&
        objectMetadata.readability === MetadataReadability.SYSTEM;
      const permissions = !isDefined(objectMetadata)
        ? new Map<string, RecordPermissionsDTO>()
        : isLegacyChat
          ? await this.agentChatSharingService.getPermissionsForThreads({
              workspaceId: authContext.workspace.id,
              userWorkspaceId: authContext.userWorkspaceId,
              threadIds: [...recordIds],
            })
          : await this.recordSharingService.getPermissionsForRecords({
              authContext,
              objectMetadataId,
              recordIds: [...recordIds],
            });
      for (const recordId of recordIds) {
        results.push({
          objectMetadataId,
          recordId,
          permissions: permissions.get(recordId) ?? denied,
        });
      }
    }
    return results;
  }
}
