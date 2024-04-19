import { Module } from '@nestjs/common';

import { ObjectMetadataRepositoryModule } from 'src/engine/object-metadata-repository/object-metadata-repository.module';
import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { TimelineActivityService } from 'src/modules/event/services/timeline-activity.service';
import { TimelineActivityObjectMetadata } from 'src/modules/event/standard-objects/timeline-activity.object-metadata';

@Module({
  imports: [
    WorkspaceDataSourceModule,
    ObjectMetadataRepositoryModule.forFeature([TimelineActivityObjectMetadata]),
  ],
  providers: [TimelineActivityService],
  exports: [TimelineActivityService],
})
export class TimelineActivityModule {}
