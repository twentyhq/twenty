import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/integrations/message-queue/interfaces/message-queue-job.interface';

import { EnvironmentService } from 'src/integrations/environment/environment.service';

export type FetchMessagesJobData = {
  workspaceId: string;
};

@Injectable()
export class FetchMessagesJob implements MessageQueueJob<FetchMessagesJobData> {
  constructor(private readonly environmentService: EnvironmentService) {}

  async handle(data: FetchMessagesJobData): Promise<void> {
    console.log(
      `fetching messages for workspace ${
        data.workspaceId
      } with ${this.environmentService.getMessageQueueDriverType()}`,
    );
  }
}
