import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';

@Injectable()
export class CreateCompanyAndContactListener {
  constructor(
    @Inject(MessageQueue.contactCreationQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @OnEvent('createContacts')
  async handleContactCreationEvent(payload: {
    workspaceId: string;
    contactsInformation: {
      displayName: string;
      handle: string;
    }[];
  }) {
    console.log(payload);
  }
}
