import { Module } from '@nestjs/common';

import { ValidationHandlerFactory } from 'src/workspace/workspace-query-runner/validation-handler/factories/validation-handler.factory';
import { PersonValidationHandler } from 'src/workspace/workspace-query-runner/validation-handler/handlers/person-validation-handler';

@Module({
  imports: [],
  providers: [PersonValidationHandler, ValidationHandlerFactory],
  exports: [ValidationHandlerFactory],
})
export class ValidationHandlerModule {}
