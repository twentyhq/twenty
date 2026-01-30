import { Module } from '@nestjs/common';

import { LogicFunctionBuildService } from 'src/engine/metadata-modules/logic-function-build/logic-function-build.service';

@Module({
  providers: [LogicFunctionBuildService],
  exports: [LogicFunctionBuildService],
})
export class LogicFunctionBuildModule {}
