import { DataSource, EntitySchema } from 'typeorm';

import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { buildAgentChatChannelAccessQuery } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-channel-access-query.util';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

class MetadataDataSource extends DataSource {
  async prepareMetadata(): Promise<void> {
    await this.buildMetadatas();
  }
}

it.each([
  {
    channelTableName: 'agentChatChannel',
    channelRoleTableName: 'agentChatChannelRole',
    permissionColumnName: 'canAccessAllAgentChatChannels',
  },
  {
    channelTableName: 'inboxChannel',
    channelRoleTableName: 'inboxChannelRole',
    permissionColumnName: 'canAccessAllInboxChannels',
  },
])(
  'uses mapped core storage names for $channelTableName access',
  async ({ channelTableName, channelRoleTableName, permissionColumnName }) => {
    const dataSource = new MetadataDataSource({
      type: 'postgres',
      entities: [
        new EntitySchema<AgentChatChannelEntity>({
          name: 'AgentChatChannelEntity',
          target: AgentChatChannelEntity,
          tableName: channelTableName,
          schema: 'core',
          columns: {
            id: { type: 'uuid', primary: true },
            workspaceId: { type: 'uuid' },
          },
        }),
        new EntitySchema<AgentChatChannelRoleEntity>({
          name: 'AgentChatChannelRoleEntity',
          target: AgentChatChannelRoleEntity,
          tableName: channelRoleTableName,
          schema: 'core',
          columns: {
            id: { type: 'uuid', primary: true },
            channelId: { type: 'uuid' },
            roleId: { type: 'uuid' },
            workspaceId: { type: 'uuid' },
          },
        }),
        new EntitySchema<RoleEntity>({
          name: 'RoleEntity',
          target: RoleEntity,
          schema: 'core',
          tableName: 'role',
          columns: {
            id: { type: 'uuid', primary: true },
            workspaceId: { type: 'uuid' },
            canAccessAllAgentChatChannels: {
              type: 'boolean',
              name: permissionColumnName,
            },
          },
        }),
      ],
    });

    await dataSource.prepareMetadata();

    const query = buildAgentChatChannelAccessQuery({
      manager: dataSource.manager,
      workspaceIdParameter: '$2',
    });

    expect(query).toContain(`FROM "core"."${channelRoleTableName}"`);
    expect(query).toContain(`FROM "core"."${channelTableName}"`);
    expect(query).toContain(`"workspace_role"."${permissionColumnName}"`);
    expect(query).toContain('"channel_role"."workspaceId" = $2');
    expect(query).toContain('"channel"."workspaceId" = $2');
    expect(query).toContain(
      '"workspace_role"."workspaceId" = "channel"."workspaceId"',
    );
    expect(query).toContain(' UNION ');
  },
);
