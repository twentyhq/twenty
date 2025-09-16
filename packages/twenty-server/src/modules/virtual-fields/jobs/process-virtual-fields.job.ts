import { type ObjectRecordNonDestructiveEvent } from 'src/engine/core-modules/event-emitter/types/object-record-non-destructive-event';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import { VirtualFieldProcessor } from 'src/modules/virtual-fields/services/virtual-field-processor.service';

@Processor(MessageQueue.entityEventsToDbQueue)
export class ProcessVirtualFieldsJob {
  constructor(private readonly virtualFieldProcessor: VirtualFieldProcessor) {}

  @Process(ProcessVirtualFieldsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordNonDestructiveEvent>,
  ): Promise<void> {
    await this.virtualFieldProcessor.processEventsForComputedFields({
      events: workspaceEventBatch.events,
      workspaceId: workspaceEventBatch.workspaceId,
    });
  }
}
