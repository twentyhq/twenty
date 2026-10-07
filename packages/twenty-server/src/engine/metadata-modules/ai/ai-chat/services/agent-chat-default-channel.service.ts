import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { type EntityManager } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentChatChannelVisibility } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-channel-visibility.enum';
import { AgentChatChannelAccessService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-access.service';
import { AgentChatChannelRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-channel-record-event.service';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { type AgentChatDefaultChannelKind } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-default-channel-kind.type';
import { buildAgentChatDefaultChannelId } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-default-channel-id.util';
import { getAgentChatChannelTables } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-channel-tables.util';
import { insertAgentChatChannelMembers } from 'src/engine/metadata-modules/ai/ai-chat/utils/insert-agent-chat-channel-members.util';
import { writeAgentChatChannelGeneralAccess } from 'src/engine/metadata-modules/ai/ai-chat/utils/write-agent-chat-channel-general-access.util';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatChannelMemberWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel-member.workspace-entity';
import { type AgentChatChannelWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-channel.workspace-entity';
import { AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { isPermissionFlagGrantedToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/is-permission-flag-granted-to-flat-role.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const DEFAULT_CHANNELS: {
  kind: AgentChatDefaultChannelKind;
  name: string;
  icon: string;
  visibility: AgentChatChannelVisibility;
}[] = [
  {
    kind: 'GENERAL',
    name: 'General',
    icon: 'IconHash',
    visibility: AgentChatChannelVisibility.PUBLIC,
  },
  {
    kind: 'SYSTEM',
    name: 'System',
    icon: 'IconRobot',
    visibility: AgentChatChannelVisibility.PRIVATE,
  },
];

const CHANNEL_COLUMNS = `id, name, icon, color, visibility, "createdAt", "updatedAt", "deletedAt"`;

// No member created a default channel, so the members who manage the
// workspace own it, as a creator owns theirs
const grantDefaultChannelOwnership = async ({
  manager,
  workspaceId,
  channelId,
  ownerIds,
  channelObjectMetadataId,
}: {
  manager: EntityManager;
  workspaceId: string;
  channelId: string;
  ownerIds: string[];
  channelObjectMetadataId: string;
}): Promise<void> => {
  const { recordShareTable } = getAgentChatChannelTables(workspaceId);

  await manager.query(
    `INSERT INTO ${recordShareTable}
       ("objectMetadataId", "recordId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId")
     SELECT $1::uuid, $2::uuid, owner_id, 'WORKSPACE_MEMBER', 'FULL', 'OWNER', $2::uuid
     FROM unnest($3::uuid[]) AS owner_id
     ON CONFLICT DO NOTHING`,
    [channelObjectMetadataId, channelId, ownerIds],
  );
};

// Every workspace starts with General, which everyone with AI access joins,
// and System, where the conversations no member started land for the
// people who manage the workspace
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

  // A default channel that already exists stays as its members made it
  async ensureDefaultChannels(workspaceId: string): Promise<void> {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return;
    }

    const { channelObjectMetadataId } =
      await this.channelAccessService.findChannelObjectMetadataIds(workspaceId);
    const { channelTable } = getAgentChatChannelTables(workspaceId);
    const memberIdsByKind = await this.findDefaultMemberIds(workspaceId);

    const createdChannels = await this.threadRepository.query(
      workspaceId,
      async ({ manager }) => {
        const created: {
          channel: AgentChatChannelWorkspaceEntity;
          members: AgentChatChannelMemberWorkspaceEntity[];
        }[] = [];

        for (const { kind, name, icon, visibility } of DEFAULT_CHANNELS) {
          const [channel] = await manager.query<
            AgentChatChannelWorkspaceEntity[]
          >(
            `INSERT INTO ${channelTable} (id, name, icon, visibility)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id) DO NOTHING
             RETURNING ${CHANNEL_COLUMNS}`,
            [
              buildAgentChatDefaultChannelId({ workspaceId, kind }),
              name,
              icon,
              visibility,
            ],
          );

          if (!isDefined(channel)) {
            continue;
          }

          await grantDefaultChannelOwnership({
            manager,
            workspaceId,
            channelId: channel.id,
            ownerIds: memberIdsByKind.SYSTEM,
            channelObjectMetadataId,
          });

          await writeAgentChatChannelGeneralAccess({
            manager,
            workspaceId,
            channelId: channel.id,
            visibility,
            channelObjectMetadataId,
          });

          const members = await insertAgentChatChannelMembers({
            manager,
            workspaceId,
            channelId: channel.id,
            memberIds: memberIdsByKind[kind],
            channelObjectMetadataId,
          });

          created.push({ channel, members });
        }

        return created;
      },
    );

    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannel',
      action: DatabaseEventAction.CREATED,
      recordsAfter: createdChannels.map(({ channel }) => channel),
    });
    await this.channelRecordEventService.emit({
      workspaceId,
      objectName: 'agentChatChannelMember',
      action: DatabaseEventAction.CREATED,
      recordsAfter: createdChannels.flatMap(({ members }) => members),
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
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return;
    }

    const { channelObjectMetadataId } =
      await this.channelAccessService.findChannelObjectMetadataIds(workspaceId);
    const { channelTable } = getAgentChatChannelTables(workspaceId);
    const generalChannelId = buildAgentChatDefaultChannelId({
      workspaceId,
      kind: 'GENERAL',
    });

    const members = await this.threadRepository.query(
      workspaceId,
      async ({ manager }) => {
        const [generalChannel] = await manager.query<{ id: string }[]>(
          `SELECT id FROM ${channelTable} WHERE id = $1 AND "deletedAt" IS NULL`,
          [generalChannelId],
        );

        if (!isDefined(generalChannel)) {
          return [];
        }

        return insertAgentChatChannelMembers({
          manager,
          workspaceId,
          channelId: generalChannel.id,
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

  // Null once System is gone, leaving those conversations out of every inbox
  // as before channels existed
  async findSystemChannelId(workspaceId: string): Promise<string | null> {
    if (!(await this.sharingService.hasInboxState(workspaceId))) {
      return null;
    }

    const { channelTable } = getAgentChatChannelTables(workspaceId);
    const systemChannelId = buildAgentChatDefaultChannelId({
      workspaceId,
      kind: 'SYSTEM',
    });

    const [systemChannel] = await this.threadRepository.query(
      workspaceId,
      ({ manager }) =>
        manager.query<{ id: string }[]>(
          `SELECT id FROM ${channelTable} WHERE id = $1 AND "deletedAt" IS NULL`,
          [systemChannelId],
        ),
    );

    return systemChannel?.id ?? null;
  }

  // Seeding follows the creation of the first member, which the cached map
  // may not hold yet
  // A conversation no member started lands in System already done, and
  // comes back when it waits on an answer or fails
  async findSystemThreadChannel(
    workspaceId: string,
  ): Promise<{ channelId?: string; channelArchivedAt?: string }> {
    const systemChannelId = await this.findSystemChannelId(workspaceId);

    return isDefined(systemChannelId)
      ? {
          channelId: systemChannelId,
          channelArchivedAt: new Date().toISOString(),
        }
      : {};
  }

  private async findDefaultMemberIds(
    workspaceId: string,
  ): Promise<Record<AgentChatDefaultChannelKind, string[]>> {
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

    const memberIdsByKind: Record<AgentChatDefaultChannelKind, string[]> = {
      GENERAL: [],
      SYSTEM: [],
    };

    for (const member of Object.values(flatWorkspaceMemberMaps.byId)) {
      if (!isDefined(member) || isDefined(member.deletedAt)) {
        continue;
      }

      const userWorkspaceId =
        flatWorkspaceMemberMaps.userWorkspaceIdByUserId[member.userId];
      const roleId = isDefined(userWorkspaceId)
        ? userWorkspaceRoleMap[userWorkspaceId]
        : undefined;
      const flatRole = isDefined(roleId)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: roleId,
            flatEntityMaps: flatRoleMaps,
          })
        : undefined;

      if (
        !isDefined(flatRole) ||
        !isPermissionFlagGrantedToFlatRole({
          flatRole,
          permissionFlag: PermissionFlagType.AI,
          flatRolePermissionFlagMaps,
        })
      ) {
        continue;
      }

      memberIdsByKind.GENERAL.push(member.id);

      if (flatRole.canUpdateAllSettings) {
        memberIdsByKind.SYSTEM.push(member.id);
      }
    }

    return memberIdsByKind;
  }
}
