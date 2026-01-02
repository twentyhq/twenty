import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

export type MessageAttachmentAttachFileJobData = {
  messageId: string;
  personId: string;
};

@Processor(MessageQueue.attachmentCreationQueue)
export class MessageAttachmentAttachFileJob {
  constructor() {}

  @Process(MessageAttachmentAttachFileJob.name)
  async handle() {}
}
