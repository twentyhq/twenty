import { Injectable } from '@nestjs/common';

import { type AgentChatChannelListItemDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-list-item.dto';
import { type AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { buildAgentChatDefaultChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-default-channel-id.util';
import { buildAgentChatJoinedChannelsQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-joined-channels-query.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

type ChannelRow = Omit<
  AgentChatChannelListItemDTO,
  'canManage' | 'isSystem'
> & {
  visibility: AgentChatChannelVisibility;
};

// The channels a member can read: the ones they are in first, in their
// sidebar order, then the public ones they can join
@Injectable()
export class AgentChatChannelListService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
  ) {}

  async findChannels({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: string;
    workspaceMemberId: string;
  }): Promise<AgentChatChannelListItemDTO[]> {
    // Before the channels upgrade reaches the workspace there are none
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      return [];
    }

    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const { channelTable, memberTable, recordShareTable } =
      getAgentChatChannelTables(workspaceId);
    const roleId = await this.channelAccessService.findMemberRoleId({
      workspaceId,
      workspaceMemberId,
    });

    const rows = await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const repository =
          this.workspaceOrmManager.getRepositoryWithContextPermissions(
            'agentChatChannel',
          );
        const readableChannelQueryBuilder = repository
          .createQueryBuilder('readableChannel')
          .select('"readableChannel"."id"', 'id')
          .applyRowLevelPermissions();

        return repository.executeRaw<ChannelRow>(
          `SELECT channel.id, channel.name, channel.icon, channel.color,
             channel.visibility,
             joined_channel."channelId" IS NOT NULL AS "isMember",
             COALESCE(joined_channel."hasMembership", false) AS "canLeave",
             (SELECT count(*)::int FROM ${memberTable} member
              WHERE member."channelId" = channel.id) AS "memberCount",
             ARRAY(
               SELECT DISTINCT role_grant."principalId" FROM ${recordShareTable} role_grant
               WHERE role_grant."recordId" = channel.id AND role_grant."principalType" = 'ROLE'
                 AND role_grant."rowCause" = 'RULE' AND role_grant."sourceId" = channel.id
                 AND role_grant."deletedAt" IS NULL
             ) AS "roleIds"
           FROM ${channelTable} channel
           LEFT JOIN (${buildAgentChatJoinedChannelsQuery({
             workspaceId,
             workspaceMemberIdParameter: ':channelListWorkspaceMemberId::uuid',
             roleIdParameter: ':channelListRoleId::uuid',
           })}) joined_channel ON joined_channel."channelId" = channel.id
           WHERE channel."deletedAt" IS NULL
             AND channel.id IN (${readableChannelQueryBuilder.getQuery()})
           ORDER BY joined_channel."channelId" IS NULL, joined_channel.position NULLS LAST,
             lower(channel.name), channel.id`,
          {
            ...readableChannelQueryBuilder.getParameters(),
            channelListWorkspaceMemberId: workspaceMemberId,
            channelListRoleId: roleId ?? null,
          },
        );
      },
      authContext,
    );

    const systemChannelId = buildAgentChatDefaultChannelId({
      workspaceId,
      kind: 'SYSTEM',
    });

    // Only joined channels show their settings, so only they are checked
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        isSystem: row.id === systemChannelId,
        canManage:
          row.isMember &&
          (await this.channelAccessService.canManageChannel({
            workspaceId,
            workspaceMemberId,
            channelId: row.id,
          })),
      })),
    );
  }
}
