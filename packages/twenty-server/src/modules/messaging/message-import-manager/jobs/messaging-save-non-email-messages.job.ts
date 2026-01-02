import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessagingSaveMessagesAndEnqueueContactCreationService } from 'src/modules/messaging/message-import-manager/services/messaging-save-messages-and-enqueue-contact-creation.service';
import type { MessageWithParticipants } from 'src/modules/messaging/message-import-manager/types/message';
import type { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export type MessagingSaveNonEmailMessagesJobData = {
  connectedAccount: ConnectedAccountWorkspaceEntity;
  messageChannel: MessageChannelWorkspaceEntity;
  messagesToSave: MessageWithParticipants[];
  workspaceId: string;
};

@Processor(MessageQueue.contactCreationQueue)
export class MessagingSaveNonEmailMessagesJob {
  constructor(
    private readonly messagingSaveMessagesAndEnqueueContactCreationService: MessagingSaveMessagesAndEnqueueContactCreationService,
  ) {}

  @Process(MessagingSaveNonEmailMessagesJob.name)
  async handle(data: MessagingSaveNonEmailMessagesJobData): Promise<void> {
    const { connectedAccount, messageChannel, messagesToSave, workspaceId } =
      data;

    await this.messagingSaveMessagesAndEnqueueContactCreationService.saveMessagesAndEnqueueContactCreation(
      messagesToSave,
      messageChannel,
      connectedAccount,
      workspaceId,
    );
  }
}
