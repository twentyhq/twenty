import { WorkflowRunExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkflowRunException extends CustomException {
  constructor(message: string, code: WorkflowRunExceptionCode) {
    super(message, code);
  }
}
