import { WorkflowExecutorExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkflowExecutorException extends CustomException {
  constructor(message: string, code: WorkflowExecutorExceptionCode) {
    super(message, code);
  }
}
