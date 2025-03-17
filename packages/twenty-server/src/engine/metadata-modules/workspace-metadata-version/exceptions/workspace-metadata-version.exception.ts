import { WorkspaceMetadataVersionExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataVersionException extends CustomException {
  constructor(message: string, code: WorkspaceMetadataVersionExceptionCode) {
    super(message, code);
  }
}
