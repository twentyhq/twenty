import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatWorkflowVersionMapCacheService } from 'src/engine/metadata-modules/flat-workflow-version/services/workspace-flat-workflow-version-map-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationEntity,
      WorkflowEntity,
      WorkflowVersionEntity,
    ]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatWorkflowVersionMapCacheService],
  exports: [WorkspaceFlatWorkflowVersionMapCacheService],
})
export class FlatWorkflowVersionModule {}
