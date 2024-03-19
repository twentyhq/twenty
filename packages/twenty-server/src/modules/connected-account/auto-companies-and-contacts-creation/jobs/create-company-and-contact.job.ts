import { Injectable } from '@nestjs/common';

import { MessageQueueJob } from 'src/engine/integrations/message-queue/interfaces/message-queue-job.interface';

export type CreateCompanyAndContactJobData = {
  workspaceId: string;
  contactsToCreate: {
    displayName: string;
    handle: string;
  }[];
};

@Injectable()
export class CreateCompanyAndContactJob
  implements MessageQueueJob<CreateCompanyAndContactJobData>
{
  constructor() {}

  async handle(data: CreateCompanyAndContactJobData): Promise<void> {
    const { workspaceId, contactsToCreate } = data;

    console.log(workspaceId, contactsToCreate);
  }
}
