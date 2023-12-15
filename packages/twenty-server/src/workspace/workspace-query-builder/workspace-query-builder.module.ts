import { Module } from '@nestjs/common';

import { ObjectMetadataModule } from 'src/metadata/object-metadata/object-metadata.module';
import { FieldsStringFactory } from 'src/workspace/workspace-query-builder/factories/fields-string.factory';

import { WorkspaceQueryBuilderFactory } from './workspace-query-builder.factory';

import { workspaceQueryBuilderFactories } from './factories/factories';

@Module({
  imports: [ObjectMetadataModule],
  providers: [...workspaceQueryBuilderFactories, WorkspaceQueryBuilderFactory],
  exports: [WorkspaceQueryBuilderFactory, FieldsStringFactory],
})
export class WorkspaceQueryBuilderModule {}
