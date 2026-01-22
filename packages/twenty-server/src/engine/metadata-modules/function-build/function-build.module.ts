import { Module } from '@nestjs/common';

import { FunctionBuildService } from 'src/engine/metadata-modules/function-build/function-build.service';

@Module({
  providers: [FunctionBuildService],
  exports: [FunctionBuildService],
})
export class FunctionBuildModule {}
