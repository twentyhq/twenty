import { Injectable } from '@nestjs/common';

import { ValidationHandler } from 'src/workspace/workspace-query-runner/validation-handler/interfaces/validation-handler.interface';

import { PersonValidationHandler } from 'src/workspace/workspace-query-runner/validation-handler/handlers/person-validation-handler';

@Injectable()
export class ValidationHandlerFactory {
  async create(objectName: string): Promise<ValidationHandler> {
    switch (objectName) {
      case 'person':
        return new PersonValidationHandler();
      default:
        return {
          validate: async () => true,
        } satisfies ValidationHandler;
    }
  }
}
