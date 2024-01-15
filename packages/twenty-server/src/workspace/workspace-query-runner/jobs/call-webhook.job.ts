import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

export type CallWebhookJobData = {
  targetUrl: string;
  recordData: any;
  operation: string;
  workspaceId: string;
  webhookId: string;
};

@Injectable()
export class CallWebhookJob implements MessageQueueJob<CallWebhookJobData> {
  private readonly logger = new Logger(CallWebhookJob.name);

  constructor(private readonly httpService: HttpService) {}

  async handle(data: CallWebhookJobData): Promise<void> {
    try {
      /*const payload = {
        object: { id, singularName }
        recordId:
        operation: data.operation,
        workspaceId: data.workspaceId,
        webhookId: data.webhookId,
        eventDate:
      workspaceMember:
        recordData: {
          previousValue
          newValue
        }
    };*/
      const payload = {
        operation: data.operation,
        workspaceId: data.workspaceId,
        webhookId: data.webhookId,
        resource: data.recordData,
      };

      await this.httpService.axiosRef.post(data.targetUrl, payload);
      this.logger.log(
        `CallWebhookJob successfully called on targetUrl '${data.targetUrl}'`,
      );
    } catch (err) {
      throw new Error(
        `Error calling webhook on targetUrl '${data.targetUrl}': ${err}`,
      );
    }
  }
}
