import { Module } from '@nestjs/common';

import { ApplicationTranslationCatalogModule } from 'src/engine/metadata-modules/application-translation-catalog/application-translation-catalog.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FlatTimelineActivityTypeModule } from 'src/engine/metadata-modules/flat-timeline-activity-type/flat-timeline-activity-type.module';
import { TimelineActivityTypeResolver } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.resolver';
import { TimelineActivityTypeService } from 'src/engine/metadata-modules/timeline-activity-type/timeline-activity-type.service';

@Module({
  imports: [
    ApplicationTranslationCatalogModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    FlatTimelineActivityTypeModule,
  ],
  providers: [TimelineActivityTypeService, TimelineActivityTypeResolver],
  exports: [TimelineActivityTypeService],
})
export class TimelineActivityTypeModule {}
