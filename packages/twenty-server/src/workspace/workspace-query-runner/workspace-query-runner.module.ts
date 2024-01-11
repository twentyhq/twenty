import { Module } from '@nestjs/common';

import { WorkspaceQueryBuilderModule } from 'src/workspace/workspace-query-builder/workspace-query-builder.module';
import { WorkspaceDataSourceModule } from 'src/workspace/workspace-datasource/workspace-datasource.module';
import { CompanyListener } from 'src/workspace/workspace-query-runner/listeners/company.listener';

import { WorkspaceQueryRunnerService } from './workspace-query-runner.service';

@Module({
  imports: [WorkspaceQueryBuilderModule, WorkspaceDataSourceModule],
  providers: [WorkspaceQueryRunnerService, CompanyListener],
  exports: [WorkspaceQueryRunnerService],
})
export class WorkspaceQueryRunnerModule {}
