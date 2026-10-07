import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';

import { CodeStepBuildService } from './services/code-step-build.service';

@Module({
  imports: [WorkspaceManyOrAllFlatEntityMapsCacheModule, LogicFunctionModule],
  providers: [CodeStepBuildService],
  exports: [CodeStepBuildService],
})
export class CodeStepBuildModule {}
