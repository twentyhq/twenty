import { WorkflowStepExecutorExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkflowStepExecutorException extends CustomException {
  constructor(message: string, code: WorkflowStepExecutorExceptionCode) {
    super(message, code);
  }
}
