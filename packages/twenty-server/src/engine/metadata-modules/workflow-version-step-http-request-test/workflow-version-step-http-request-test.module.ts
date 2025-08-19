import { Module } from '@nestjs/common';

import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { WorkflowVersionStepHttpRequestTestResolver } from 'src/engine/metadata-modules/workflow-version-step-http-request-test/workflow-version-step-http-request-test.resolver';
import { WorkflowVersionStepHttpRequestTestService } from 'src/engine/metadata-modules/workflow-version-step-http-request-test/workflow-version-step-http-request-test.service';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

@Module({
  imports: [WorkspaceCacheStorageModule, TokenModule, FileModule],
  providers: [
    WorkflowVersionStepHttpRequestTestService,
    WorkflowVersionStepHttpRequestTestResolver,
  ],
  exports: [WorkflowVersionStepHttpRequestTestService],
})
export class WorkflowVersionStepHttpRequestTestModule {}
