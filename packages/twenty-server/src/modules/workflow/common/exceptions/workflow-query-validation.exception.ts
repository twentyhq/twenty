import { WorkflowQueryValidationExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkflowQueryValidationException extends CustomException {
  constructor(message: string, code: WorkflowQueryValidationExceptionCode) {
    super(message, code);
  }
}
