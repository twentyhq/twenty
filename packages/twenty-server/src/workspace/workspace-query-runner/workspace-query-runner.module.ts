import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { WorkspaceQueryBuilderModule } from 'src/workspace/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { ExceptionInterceptor } from 'src/interceptors/exception.interceptor';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

@Module({
  imports: [WorkspaceQueryBuilderModule, WorkspaceDataSourceModule],
  providers: [
    WorkspaceQueryRunnerService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ExceptionInterceptor,
    },
  ],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
