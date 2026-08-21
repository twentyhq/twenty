import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { WorkspaceFlatTimelineActivityTypeMapCacheService } from 'src/engine/metadata-modules/flat-timeline-activity-type/services/workspace-flat-timeline-activity-type-map-cache.service';
import { TimelineActivityTypeEntity } from 'src/engine/metadata-modules/timeline-activity-type/entities/timeline-activity-type.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationEntity, TimelineActivityTypeEntity]),
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [
    WorkspaceFlatTimelineActivityTypeMapCacheService,
    provideWorkspaceScopedRepository(TimelineActivityTypeEntity),
  ],
  exports: [WorkspaceFlatTimelineActivityTypeMapCacheService],
})
export class FlatTimelineActivityTypeModule {}
