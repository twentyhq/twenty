import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatWorkflowMapCacheService } from 'src/engine/metadata-modules/flat-workflow/services/workspace-flat-workflow-map-cache.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, WorkflowEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [WorkspaceFlatWorkflowMapCacheService],
  exports: [WorkspaceFlatWorkflowMapCacheService],
})
export class FlatWorkflowModule {}
