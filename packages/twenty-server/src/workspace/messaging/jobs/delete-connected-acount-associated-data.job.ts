import { Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { MessageChannelMessageAssociationService } from 'src/workspace/messaging/repositories/message-channel-message-association/message-channel-message-association.service';
import { MessageChannelService } from 'src/workspace/messaging/repositories/message-channel/message-channel.service';

export type DeleteConnectedAccountAssociatedDataJobData = {
  workspaceId: string;
  connectedAccountId: string;
};

@Injectable()
export class DeleteConnectedAccountAssociatedDataJob
  implements MessageQueueJob<DeleteConnectedAccountAssociatedDataJobData>
{
  private readonly logger = new Logger(
    DeleteConnectedAccountAssociatedDataJob.name,
  );

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly messageChannelService: MessageChannelService,
    private readonly typeORMService: TypeORMService,
    private readonly messageChannelMessageAssociationService: MessageChannelMessageAssociationService,
  ) {}

  async handle(
    data: DeleteConnectedAccountAssociatedDataJobData,
  ): Promise<void> {
    this.logger.log(
      `Deleting connected account ${data.connectedAccountId} associated data in workspace ${data.workspaceId}`,
    );

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        data.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    await workspaceDataSource?.transaction(async (transactionManager) => {
      const messageChannels =
        await this.messageChannelService.getByConnectedAccountId(
          data.connectedAccountId,
          data.workspaceId,
          transactionManager,
        );

      await this.messageChannelMessageAssociationService.deleteByMessageChannelIds(
        messageChannels.map((messageChannel) => messageChannel.id),
        data.workspaceId,
        transactionManager,
      );
    });

    this.logger.log(
      `Deleted connected account ${data.connectedAccountId} associated data in workspace ${data.workspaceId}`,
    );
  }
}
