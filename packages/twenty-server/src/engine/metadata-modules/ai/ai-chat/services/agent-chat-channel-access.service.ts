import { Injectable } from '@nestjs/common';

import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RecordSharePrincipalService } from 'src/engine/core-modules/record-share/services/record-share-principal.service';
import { RecordSharingService } from 'src/engine/core-modules/record-share/services/record-sharing.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatChannelAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-channel-access-args.type';
import { buildAgentChatJoinedChannelsQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-joined-channels-query.util';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import {
  throwAgentChatChannelManagementForbidden,
  throwAgentChatChannelNotFound,
} from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-channel-errors.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Reading and replying in a channel go through its grants. Shaping it is
// left to its members, and who joins it to who manages it
@Injectable()
export class AgentChatChannelAccessService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly recordSharingService: RecordSharingService,
    private readonly recordSharePrincipalService: RecordSharePrincipalService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async assertChannelAccess({
    operationType,
    ...args
  }: AgentChatChannelAccessArgs & {
    operationType: OperationType;
  }): Promise<void> {
    const authContext = await this.sharingService.getAuthContext(args);

    const allowedChannelIds =
      await this.workspaceOrmManager.executeInWorkspaceContext(
        () =>
          this.workspaceOrmManager
            .getRepositoryWithContextPermissions('agentChatChannel')
            .findRecordIdsAllowedForOperation({
              recordIds: [args.channelId],
              operationType,
            }),
        authContext,
      );

    if (allowedChannelIds.length !== 1) {
      throwAgentChatChannelNotFound();
    }
  }

  // Everyone can reply in a public channel, but only its members shape it
  async assertMemberOrManager(args: AgentChatChannelAccessArgs): Promise<void> {
    await this.assertChannelAccess({ ...args, operationType: 'update' });

    if (!(await this.isMember(args))) {
      await this.assertCanManageChannel(args);
    }
  }

  // Through a membership row, or through a role the channel is open to
  async isMember(args: AgentChatChannelAccessArgs): Promise<boolean> {
    const roleId = await this.findMemberRoleId(args);
    const [joinedChannel] = await this.threadRepository.query(
      args.workspaceId,
      ({ manager }) =>
        manager.query<{ channelId: string }[]>(
          `SELECT joined_channel."channelId"
           FROM (${buildAgentChatJoinedChannelsQuery({
             workspaceId: args.workspaceId,
             workspaceMemberIdParameter: '$2::uuid',
             roleIdParameter: '$3::uuid',
           })}) joined_channel
           WHERE joined_channel."channelId" = $1`,
          [args.channelId, args.workspaceMemberId, roleId ?? null],
        ),
    );

    return isDefined(joinedChannel);
  }

  async findMemberRoleId({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<string | undefined> {
    const [roleId] = await this.recordSharePrincipalService.resolveRoleIds({
      workspaceId,
      principals: [
        {
          principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
          principalId: workspaceMemberId,
        },
      ],
    });

    return roleId;
  }

  async assertCanManageChannel(
    args: AgentChatChannelAccessArgs,
  ): Promise<void> {
    if (!(await this.canManageChannel(args))) {
      throwAgentChatChannelManagementForbidden();
    }
  }

  async canManageChannel(args: AgentChatChannelAccessArgs): Promise<boolean> {
    const authContext = await this.sharingService.getAuthContext(args);
    const { channelObjectMetadataId } = await this.findChannelObjectMetadataIds(
      args.workspaceId,
    );

    const sharing = await this.recordSharingService
      .getSharing({
        objectMetadataId: channelObjectMetadataId,
        recordId: args.channelId,
        authContext,
      })
      .catch(() => throwAgentChatChannelNotFound());

    return sharing.canManageSharing;
  }

  async findChannelObjectMetadataIds(workspaceId: string) {
    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const channelObjectMetadata = findAgentChatFlatObjectMetadata(
      flatObjectMetadataMaps,
      'agentChatChannel',
    );

    if (!isDefined(channelObjectMetadata)) {
      throw new AiException(
        'Chat channels are not available until this workspace finishes upgrading',
        AiExceptionCode.CHAT_CHANNELS_UNAVAILABLE,
      );
    }

    return { channelObjectMetadataId: channelObjectMetadata.id };
  }
}
