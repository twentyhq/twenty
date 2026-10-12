import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AGENT_CHAT_CHANNEL_COLUMNS } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-channel-columns.constant';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-record-event.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatDefaultChannelKind } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-default-channel-kind.type';
import { buildAgentChatDefaultChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-default-channel-id.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { insertAgentChatChannelMembers } from 'src/engine/metadata-modules/ai/ai-chat/utils/insert-agent-chat-channel-members.util';
import { writeAgentChatChannelOwnerGrants } from 'src/engine/metadata-modules/ai/ai-chat/utils/write-agent-chat-channel-owner-grants.util';
import { writeAgentChatChannelGeneralAccess } from 'src/engine/metadata-modules/ai/ai-chat/utils/write-agent-chat-channel-general-access.util';
import { writeAgentChatChannelRoleAccess } from 'src/engine/metadata-modules/ai/ai-chat/utils/write-agent-chat-channel-role-access.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatChannelWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const DEFAULT_CHANNELS: Record<
  AgentChatDefaultChannelKind,
  { name: string; icon: string; visibility: AgentChatChannelVisibility }
> = {
  GENERAL: {
    name: 'General',
    icon: 'IconHash',
    visibility: AgentChatChannelVisibility.PUBLIC,
  },
  SYSTEM: {
    name: 'System',
    icon: 'IconRobot',
    visibility: AgentChatChannelVisibility.PRIVATE,
  },
};

// Every workspace starts with General, which everyone with AI access joins,
// and System, where the conversations no member started land. System is open
// to the roles that manage the workspace rather than to their members at
// the time, so whoever holds one of those roles later reads and manages it
@Injectable()
export class AgentChatDefaultChannelService {
  constructor(
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    private readonly sharingService: AgentChatSharingService,
    private readonly channelAccessService: AgentChatChannelAccessService,
    private readonly channelRecordEventService: AgentChatChannelRecordEventService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  // A default channel that already exists stays as its members made it.
  // No member created them, so the members who manage the workspace own
  // General, and System opens to their roles
  async ensureDefaultChannels(workspaceId: string): Promise<void> {
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      return;
    }

    const channelObjectMetadataId =
      await this.channelAccessService.findChannelObjectMetadataId(workspaceId);
    const { generalMemberIds, managerMemberIds, systemRoleIds } =
      await this.findDefaultAccess(workspaceId);

    const { channels, members } = await this.threadRepository.query(
      workspaceId,
      async ({ manager }) => {
        const generalChannel = await this.insertDefaultChannel({
          manager,
          workspaceId,
          kind: 'GENERAL',
        });
        const systemChannel = await this.insertDefaultChannel({
          manager,
          workspaceId,
          kind: 'SYSTEM',
        });

        if (isDefined(systemChannel)) {
          await writeAgentChatChannelRoleAccess({
            manager,
            workspaceId,
            channelId: systemChannel.id,
            roleIds: systemRoleIds,
            channelObjectMetadataId,
            accessLevel: RecordShareAccessLevel.FULL,
          });
        }

        if (!isDefined(generalChannel)) {
          return { channels: [systemChannel].filter(isDefined), members: [] };
        }

        await writeAgentChatChannelGeneralAccess({
          manager,
          workspaceId,
          channelId: generalChannel.id,
          visibility: DEFAULT_CHANNELS.GENERAL.visibility,
          channelObjectMetadataId,
        });
        await writeAgentChatChannelOwnerGrants({
          manager,
          workspaceId,
          channelId: generalChannel.id,
          ownerIds: managerMemberIds,
          channelObjectMetadataId,
        });

        return {
          channels: [generalChannel, systemChannel].filter(isDefined),
          members: await insertAgentChatChannelMembers({
            manager,
            workspaceId,
            channelId: generalChannel.id,
            memberIds: generalMemberIds,
            channelObjectMetadataId,
          }),
        };
      },
    );

    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannel',
      action: DatabaseEventAction.CREATED,
      recordsAfter: channels,
    });
    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.CREATED,
      recordsAfter: members,
    });
  }

  // Members joining the workspace join General, if it is still there.
  // Their role may not be set yet, and General without AI access shows
  // nothing, so no permission is checked
  async addMembersToGeneral({
    workspaceId,
    workspaceMemberIds,
  }: {
    workspaceId: string;
    workspaceMemberIds: string[];
  }): Promise<void> {
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      return;
    }

    const channelObjectMetadataId =
      await this.channelAccessService.findChannelObjectMetadataId(workspaceId);

    const members = await this.threadRepository.query(
      workspaceId,
      async ({ manager }) => {
        const generalChannelId = await this.findLiveDefaultChannelId({
          manager,
          workspaceId,
          kind: 'GENERAL',
        });

        if (!isDefined(generalChannelId)) {
          return [];
        }

        return insertAgentChatChannelMembers({
          manager,
          workspaceId,
          channelId: generalChannelId,
          memberIds: workspaceMemberIds,
          channelObjectMetadataId,
        });
      },
    );

    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.CREATED,
      recordsAfter: members,
    });
  }

  // A conversation no member started lands in System already done, and
  // comes back when it waits on an answer or fails. Once System is gone it
  // stays out of every inbox, as before channels existed
  async findSystemThreadChannel(
    workspaceId: string,
  ): Promise<{ channelId?: string; channelArchivedAt?: string }> {
    if (!(await this.sharingService.hasChannels(workspaceId))) {
      return {};
    }

    const systemChannelId = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        this.findLiveDefaultChannelId({ manager, workspaceId, kind: 'SYSTEM' }),
    );

    return isDefined(systemChannelId)
      ? {
          channelId: systemChannelId,
          channelArchivedAt: new Date().toISOString(),
        }
      : {};
  }

  private async insertDefaultChannel({
    manager,
    workspaceId,
    kind,
  }: {
    manager: EntityManager;
    workspaceId: string;
    kind: AgentChatDefaultChannelKind;
  }): Promise<AgentChatChannelWorkspaceEntity | undefined> {
    const { channelTable } = getAgentChatChannelTables(workspaceId);
    const { name, icon, visibility } = DEFAULT_CHANNELS[kind];

    const [channel] = await manager.query<AgentChatChannelWorkspaceEntity[]>(
      `INSERT INTO ${channelTable} (id, name, icon, visibility)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING
       RETURNING ${AGENT_CHAT_CHANNEL_COLUMNS}`,
      [
        buildAgentChatDefaultChannelId({ workspaceId, kind }),
        name,
        icon,
        visibility,
      ],
    );

    return channel;
  }

  private async findLiveDefaultChannelId({
    manager,
    workspaceId,
    kind,
  }: {
    manager: EntityManager;
    workspaceId: string;
    kind: AgentChatDefaultChannelKind;
  }): Promise<string | undefined> {
    const { channelTable } = getAgentChatChannelTables(workspaceId);

    const [channel] = await manager.query<{ id: string }[]>(
      `SELECT id FROM ${channelTable} WHERE id = $1 AND "deletedAt" IS NULL`,
      [buildAgentChatDefaultChannelId({ workspaceId, kind })],
    );

    return channel?.id;
  }

  // Seeding follows the creation of the first member, which the cached map
  // may not hold yet
  private async findDefaultAccess(workspaceId: string): Promise<{
    generalMemberIds: string[];
    managerMemberIds: string[];
    systemRoleIds: string[];
  }> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
    ]);

    const {
      flatWorkspaceMemberMaps,
      userWorkspaceRoleMap,
      flatRoleMaps,
      flatRolePermissionFlagMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
      'userWorkspaceRoleMap',
      'flatRoleMaps',
      'flatRolePermissionFlagMaps',
    ]);

    const aiRoles = Object.values(flatRoleMaps.byUniversalIdentifier).filter(
      (flatRole): flatRole is NonNullable<typeof flatRole> =>
        isDefined(flatRole) &&
        flatRole.canBeAssignedToUsers &&
        isPermissionFlagGrantedToFlatRole({
          flatRole,
          permissionFlag: PermissionFlagType.AI,
          flatRolePermissionFlagMaps,
        }),
    );
    const aiRoleById = new Map(
      aiRoles.map((flatRole) => [flatRole.id, flatRole]),
    );

    const generalMemberIds: string[] = [];
    const managerMemberIds: string[] = [];

    for (const member of Object.values(flatWorkspaceMemberMaps.byId)) {
      if (!isDefined(member) || isDefined(member.deletedAt)) {
        continue;
      }

      const userWorkspaceId =
        flatWorkspaceMemberMaps.userWorkspaceIdByUserId[member.userId];
      const roleId = isDefined(userWorkspaceId)
        ? userWorkspaceRoleMap[userWorkspaceId]
        : undefined;
      const flatRole = isDefined(roleId) ? aiRoleById.get(roleId) : undefined;

      if (!isDefined(flatRole)) {
        continue;
      }

      generalMemberIds.push(member.id);

      if (flatRole.canUpdateAllSettings) {
        managerMemberIds.push(member.id);
      }
    }

    return {
      generalMemberIds,
      managerMemberIds,
      systemRoleIds: aiRoles
        .filter((flatRole) => flatRole.canUpdateAllSettings)
        .map(({ id }) => id),
    };
  }
}
