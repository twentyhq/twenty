import { Module } from '@nestjs/common';

import { ServerlessFunctionBuildService } from 'src/engine/metadata-modules/serverless-function-build/serverless-function-build.service';

@Module({
  providers: [ServerlessFunctionBuildService],
  exports: [ServerlessFunctionBuildService],
})
export class ServerlessFunctionBuildModule {}
