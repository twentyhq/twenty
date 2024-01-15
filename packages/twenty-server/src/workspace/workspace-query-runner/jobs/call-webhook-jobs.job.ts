import { Inject, Injectable, Logger } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';
import { ObjectMetadataInterface } from 'src/metadata/field-metadata/interfaces/object-metadata.interface';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';
import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { MessageQueueService } from 'src/integrations/message-queue/services/message-queue.service';
import { MessageQueue } from 'src/integrations/message-queue/message-queue.constants';
import {
  CallWebhookJob,
  CallWebhookJobData,
} from 'src/workspace/workspace-query-runner/jobs/call-webhook.job';

export enum CallWebhookJobsJobOperation {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export type CallWebhookJobsJobData = {
  workspaceId: string;
  objectMetadataItem: ObjectMetadataInterface;
  recordData: any;
  operation: CallWebhookJobsJobOperation;
};

@Injectable()
export class CallWebhookJobsJob
  implements MessageQueueJob<CallWebhookJobsJobData>
{
  private readonly logger = new Logger(CallWebhookJobsJob.name);

  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly dataSourceService: DataSourceService,
    @Inject(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async handle(data: CallWebhookJobsJobData): Promise<void> {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        data.workspaceId,
      );
    const workspaceDataSource =
      await this.workspaceDataSourceService.connectToWorkspaceDataSource(
        data.workspaceId,
      );
    const eventType = `${data.operation}.${data.objectMetadataItem.nameSingular}`;
    const webhooks: { id: string; targetUrl: string }[] =
      await workspaceDataSource?.query(
        `SELECT * FROM ${dataSourceMetadata.schema}."webhook" WHERE operation='${eventType}'`,
      );

    webhooks.forEach((webhook) => {
      this.messageQueueService.add<CallWebhookJobData>(
        CallWebhookJob.name,
        {
          targetUrl: webhook.targetUrl,
          eventType,
          object: {
            id: data.objectMetadataItem.id,
            nameSingular: data.objectMetadataItem.nameSingular,
          },
          workspaceId: data.workspaceId,
          webhookId: webhook.id,
          eventDate: new Date(),
          recordData: data.recordData,
        },
        { retryLimit: 3 },
      );
    });

    if (webhooks.length) {
      this.logger.log(
        `CallWebhookJobsJob on eventType '${eventType}' called on webhooks ids [\n"${webhooks
          .map((webhook) => webhook.id)
          .join('",\n"')}"\n]`,
      );
    }
  }
}
