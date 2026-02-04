import { Module } from '@nestjs/common';

import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';

import { CodeStepBuildService } from './services/code-step-build.service';

@Module({
  imports: [FileStorageModule],
  providers: [CodeStepBuildService],
  exports: [CodeStepBuildService],
})
export class CodeStepBuildModule {}
