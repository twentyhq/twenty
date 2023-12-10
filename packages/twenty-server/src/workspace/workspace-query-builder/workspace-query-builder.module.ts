import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';

import { WorkspaceQueryBuilderFactory } from './workspace-query-builder.factory';

import { workspaceQueryBuilderFactories } from './factories/factories';

@Module({
  imports: [ObjectMetadataModule],
  providers: [...workspaceQueryBuilderFactories, WorkspaceQueryBuilderFactory],
  exports: [WorkspaceQueryBuilderFactory],
})
export class WorkspaceQueryBuilderModule {}
