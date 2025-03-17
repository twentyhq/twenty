import { WorkflowVersionStepExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionStepException extends CustomException {
  constructor(message: string, code: WorkflowVersionStepExceptionCode) {
    super(message, code);
  }
}
