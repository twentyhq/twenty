import { Module } from '@nestjs/common';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { LogicFunctionResourceModule } from 'src/engine/core-modules/logic-function/logic-function-resource/logic-function-resource.module';
import { CreateCompanyWhenAddingNewPersonCodeStepLogicFunctionService } from 'src/engine/workspace-manager/standard-objects-prefill-data/services/create-company-when-adding-new-person-code-step-logic-function.service';

@Module({
  imports: [ApplicationModule, LogicFunctionResourceModule],
  providers: [CreateCompanyWhenAddingNewPersonCodeStepLogicFunctionService],
  exports: [CreateCompanyWhenAddingNewPersonCodeStepLogicFunctionService],
})
export class StandardObjectsPrefillModule {}
