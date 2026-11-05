import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { DataSource, EntitySchema } from 'typeorm';

import { AgentChatChannelEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel.entity';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

export const createChatChannelTestDataSource = (): DataSource => {
  const channelMetadata = getAppProviderByClassName<DataSource>(
    'DataSource',
  ).getMetadata(AgentChatChannelEntity.name);
  const idColumn = channelMetadata.findColumnWithPropertyName('id');
  const workspaceIdColumn =
    channelMetadata.findColumnWithPropertyName('workspaceId');

  assertIsDefinedOrThrow(idColumn);
  assertIsDefinedOrThrow(workspaceIdColumn);

  return new DataSource({
    ...global.testDataSource.options,
    entities: [
      new EntitySchema<AgentChatChannelEntity>({
        name: AgentChatChannelEntity.name,
        target: AgentChatChannelEntity,
        schema: channelMetadata.schema,
        tableName: channelMetadata.tableName,
        columns: {
          id: {
            type: idColumn.type,
            primary: true,
            name: idColumn.databaseName,
          },
          workspaceId: {
            type: workspaceIdColumn.type,
            name: workspaceIdColumn.databaseName,
          },
        },
      }),
    ],
  });
};
