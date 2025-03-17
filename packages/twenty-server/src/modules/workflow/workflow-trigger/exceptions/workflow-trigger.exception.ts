import { WorkflowTriggerExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkflowTriggerException extends CustomException {
  constructor(message: string, code: WorkflowTriggerExceptionCode) {
    super(message, code);
  }
}
