import { Command, CommandRunner, Option } from 'nest-commander';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { MessagingProducer } from 'src/workspace/messaging/producers/messaging-producer';

interface FetchWorkspaceMessagesOptions {
  workspaceId: string;
}

@Command({
  name: 'workspace:fetch-messages',
  description: 'Fetch messages of all workspaceMembers in a workspace.',
})
export class FetchWorkspaceMessagesCommand extends CommandRunner {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly messagingProducer: MessagingProducer,
  ) {
    super();
  }

  async run(
    _passedParam: string[],
    options: FetchWorkspaceMessagesOptions,
  ): Promise<void> {
    await this.fetchWorkspaceMessages(options.workspaceId);

    return;
  }

  @Option({
    flags: '-w, --workspace-id [workspace_id]',
    description: 'workspace id',
    required: true,
  })
  parseWorkspaceId(value: string): string {
    return value;
  }

  async fetchWorkspaceMessages(workspaceId: string): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (!workspaceDataSource) {
      throw new Error('No workspace data source found');
    }

    const connectedAccounts = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."connectedAccount" WHERE "provider" = 'gmail'`,
    );

    if (!connectedAccounts || connectedAccounts.length === 0) {
      throw new Error('No connected account found');
    }

    for (const connectedAccount of connectedAccounts) {
      await this.messagingProducer.enqueueFetchAllMessagesFromConnectedAccount(
        { workspaceId, connectedAccountId: connectedAccount.id },
        `${workspaceId}-${connectedAccount.id}`,
      );
    }
  }
}
