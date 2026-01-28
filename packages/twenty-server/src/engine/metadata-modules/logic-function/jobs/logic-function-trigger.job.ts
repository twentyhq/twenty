import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/logic-function.service';

export type LogicFunctionTriggerJobData = {
  logicFunctionId: string;
  workspaceId: string;
  payload?: object;
};

@Processor({
  queueName: MessageQueue.logicFunctionQueue,
  scope: Scope.REQUEST,
})
export class LogicFunctionTriggerJob {
  constructor(private readonly logicFunctionService: LogicFunctionService) {}

  @Process(LogicFunctionTriggerJob.name)
  async handle(logicFunctionPayloads: LogicFunctionTriggerJobData[]) {
    await Promise.all(
      logicFunctionPayloads.map(
        async (logicFunctionPayload) =>
          await this.logicFunctionService.executeOneLogicFunction({
            id: logicFunctionPayload.logicFunctionId,
            workspaceId: logicFunctionPayload.workspaceId,
            payload: logicFunctionPayload.payload || {},
            version: 'draft',
          }),
      ),
    );
  }
}
