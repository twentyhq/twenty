import { Injectable } from '@nestjs/common';

import { type AgentChatChannelListItemDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/agent-chat-channel-list-item.dto';
import { type AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

type ChannelRow = Omit<AgentChatChannelListItemDTO, 'canManage'> & {
  visibility: AgentChatChannelVisibility;
};

// The channels a member can read: the ones they joined first, in their
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
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return [];
    }

    const authContext = await this.sharingService.getAuthContext({
      workspaceId,
      workspaceMemberId,
    });
    const { channelTable, memberTable } =
      getAgentChatChannelTables(workspaceId);

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
             membership.id IS NOT NULL AS "isMember",
             (SELECT count(*)::int FROM ${memberTable} member
              WHERE member."channelId" = channel.id) AS "memberCount"
           FROM ${channelTable} channel
           LEFT JOIN ${memberTable} membership
             ON membership."channelId" = channel.id
             AND membership."workspaceMemberId" = :channelListWorkspaceMemberId::uuid
           WHERE channel."deletedAt" IS NULL
             AND channel.id IN (${readableChannelQueryBuilder.getQuery()})
           ORDER BY membership.position NULLS LAST, lower(channel.name), channel.id`,
          {
            ...readableChannelQueryBuilder.getParameters(),
            channelListWorkspaceMemberId: workspaceMemberId,
          },
        );
      },
      authContext,
    );

    // Only joined channels show their settings, so only they are checked
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
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
