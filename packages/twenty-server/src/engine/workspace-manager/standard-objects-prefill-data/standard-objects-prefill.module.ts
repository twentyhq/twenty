import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { FrontComponentModule } from 'src/engine/metadata-modules/front-component/front-component.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { PrefillFrontComponentService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-front-component.service';
import { PrefillLogicFunctionService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-logic-function.service';

@Module({
  imports: [
    LogicFunctionModule,
    FrontComponentModule,
    FileStorageModule,
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
  ],
  providers: [PrefillLogicFunctionService, PrefillFrontComponentService],
  exports: [PrefillLogicFunctionService, PrefillFrontComponentService],
})
export class StandardObjectsPrefillModule {}
