import { WorkspaceCleanerExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceCleanerException extends CustomException {
  constructor(message: string, code: WorkspaceCleanerExceptionCode) {
    super(message, code);
  }
}
