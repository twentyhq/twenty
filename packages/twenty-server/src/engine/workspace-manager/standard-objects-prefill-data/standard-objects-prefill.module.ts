import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';
import { PrefillLogicFunctionService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/prefill-logic-function.service';

@Module({
  imports: [LogicFunctionModule, WorkspaceManyOrAllFlatEntityMapsCacheModule],
  providers: [PrefillLogicFunctionService],
  exports: [PrefillLogicFunctionService],
})
export class StandardObjectsPrefillModule {}
