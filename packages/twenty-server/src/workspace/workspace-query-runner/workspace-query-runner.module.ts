import { Module } from '@nestjs/common';

import { WorkspaceQueryBuilderModule } from 'src/workspace/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

@Module({
  imports: [WorkspaceQueryBuilderModule, WorkspaceDataSourceModule],
  providers: [WorkspaceQueryRunnerService],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
