import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import {
  CreateCompanyAndContactJobData,
  CreateCompanyAndContactJob,
} from 'src/modules/connected-account/auto-companies-and-contacts-creation/jobs/create-company-and-contact.job';

@Injectable()
export class CreateCompanyAndContactListener {
  constructor(
    @Inject(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('createContacts')
  async handleContactCreationEvent(payload: {
    workspaceId: string;
    connectedAccountHandle: string;
    contactsToCreate: {
      displayName: string;
      handle: string;
    }[];
  }) {
    await this.messageQueueService.add<CreateCompanyAndContactJobData>(
      CreateCompanyAndContactJob.name,
      payload,
    );
  }
}
