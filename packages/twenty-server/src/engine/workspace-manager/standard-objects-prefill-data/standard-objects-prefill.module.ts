import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { PrefillFrontComponentService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-front-component.service';

@Module({
  imports: [
    FrontComponentModule,
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [PrefillFrontComponentService],
  exports: [PrefillFrontComponentService],
})
export class StandardObjectsPrefillModule {}
