import { Logger } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { LogicFunctionPrebuiltConversionService } from 'src/engine/metadata-modules/logic-function/services/logic-function-prebuilt-conversion.service';

export type ConvertApplicationLogicFunctionsToPrebuiltJobData = {
  workspaceId: string;
  applicationId: string;
};

@Processor(MessageQueue.logicFunctionQueue)
export class ConvertApplicationLogicFunctionsToPrebuiltJob {
  private readonly logger = new Logger(
    ConvertApplicationLogicFunctionsToPrebuiltJob.name,
  );

  constructor(
    private readonly logicFunctionPrebuiltConversionService: LogicFunctionPrebuiltConversionService,
  ) {}

  @Process(ConvertApplicationLogicFunctionsToPrebuiltJob.name)
  async handle({
    workspaceId,
    applicationId,
  }: ConvertApplicationLogicFunctionsToPrebuiltJobData): Promise<void> {
    const convertedFlatLogicFunctions =
      await this.logicFunctionPrebuiltConversionService.convertApplicationLogicFunctionsToPrebuilt(
        { workspaceId, applicationId },
      );

    if (convertedFlatLogicFunctions.length === 0) {
      return;
    }

    this.logger.log(
      `Converted ${convertedFlatLogicFunctions.length} logic function(s) of application '${applicationId}' to prebuilt (workspace=${workspaceId})`,
    );
  }
}
