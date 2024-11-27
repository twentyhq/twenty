import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { SeedWorkflowViewsCommand } from 'src/modules/workflow/common/commands/seed-workflow-views.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace], 'core'),
    TypeOrmModule.forFeature(
      [ObjectMetadataEntity, FieldMetadataEntity],
      'metadata',
    ),
  ],
  providers: [SeedWorkflowViewsCommand],
  exports: [SeedWorkflowViewsCommand],
})
export class WorkflowCommandModule {}
