import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { LogicFunctionModule } from 'src/engine/metadata-modules/logic-function/logic-function.module';

import { CodeStepBuildService } from './services/code-step-build.service';

@Module({
  imports: [
    ApplicationModule,
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    LogicFunctionModule,
    FeatureFlagModule,
  ],
  providers: [CodeStepBuildService],
  exports: [CodeStepBuildService],
})
export class CodeStepBuildModule {}
