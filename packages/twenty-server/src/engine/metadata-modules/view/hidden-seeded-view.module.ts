import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { HiddenSeededViewService } from 'src/engine/metadata-modules/view/services/hidden-seeded-view.service';

@Module({
  imports: [
    ApplicationModule,
    FeatureFlagModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [HiddenSeededViewService],
  exports: [HiddenSeededViewService],
})
export class HiddenSeededViewModule {}
