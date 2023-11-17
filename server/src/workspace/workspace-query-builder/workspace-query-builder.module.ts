import { Module } from '@nestjs/common';

import { WorkspaceQueryBuilderFactory } from './workspace-query-builder.factory';

import { workspaceQueryBuilderFactories } from './factories/factories';

@Module({
  imports: [],
  providers: [...workspaceQueryBuilderFactories, WorkspaceQueryBuilderFactory],
  exports: [WorkspaceQueryBuilderFactory],
})
export class WorkspaceQueryBuilderModule {}
