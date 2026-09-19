import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import {
  PROCESS_DEFERRED_SCHEMA_OPERATIONS_JOB_NAME,
  type ProcessDeferredSchemaOperationsJobData,
} from 'src/engine/metadata-modules/deferred-schema-operation/jobs/process-deferred-schema-operations.job-constants';
import { DeferredSchemaOperationService } from 'src/engine/metadata-modules/deferred-schema-operation/services/deferred-schema-operation.service';

@Processor(MessageQueue.workspaceQueue)
export class ProcessDeferredSchemaOperationsJob {
  constructor(
    private readonly deferredSchemaOperationService: DeferredSchemaOperationService,
  ) {}

  @Process(PROCESS_DEFERRED_SCHEMA_OPERATIONS_JOB_NAME)
  async handle(data: ProcessDeferredSchemaOperationsJobData): Promise<void> {
    await this.deferredSchemaOperationService.processWorkspace(
      data.workspaceId,
    );
  }
}
