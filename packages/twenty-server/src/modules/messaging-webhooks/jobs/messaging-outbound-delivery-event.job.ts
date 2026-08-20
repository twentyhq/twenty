import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { OutboundDeliveryEventProcessorService } from 'src/modules/messaging-webhooks/handlers/outbound-delivery-event-processor.service';
import { type NormalizedOutboundDeliveryEvent } from 'src/modules/messaging-webhooks/types/normalized-outbound-delivery-event.type';

@Processor(MessageQueue.emailQueue)
export class MessagingOutboundDeliveryEventJob {
  constructor(
    private readonly outboundDeliveryEventProcessorService: OutboundDeliveryEventProcessorService,
  ) {}

  @Process(MessagingOutboundDeliveryEventJob.name)
  async handle(data: NormalizedOutboundDeliveryEvent): Promise<void> {
    await this.outboundDeliveryEventProcessorService.process(data);
  }
}
