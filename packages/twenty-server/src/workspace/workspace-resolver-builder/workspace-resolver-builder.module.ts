import { Module } from '@nestjs/common';

import { WorkspaceQueryRunnerModule } from 'src/workspace/workspace-query-runner/workspace-query-runner.module';
import { QuickActionsModule } from 'src/core/quick-actions/quick-actions.module';

import { WorkspaceResolverFactory } from './workspace-resolver.factory';

import { workspaceResolverBuilderFactories } from './factories/factories';

@Module({
  imports: [WorkspaceQueryRunnerModule, QuickActionsModule],
  providers: [...workspaceResolverBuilderFactories, WorkspaceResolverFactory],
  exports: [WorkspaceResolverFactory],
})
export class WorkspaceResolverBuilderModule {}
