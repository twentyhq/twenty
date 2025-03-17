import { WorkspaceMigrationExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMigrationException extends CustomException {
  constructor(message: string, code: WorkspaceMigrationExceptionCode) {
    super(message, code);
  }
}
