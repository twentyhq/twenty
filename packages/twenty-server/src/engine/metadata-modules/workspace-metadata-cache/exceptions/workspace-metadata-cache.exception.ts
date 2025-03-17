import { WorkspaceMetadataCacheExceptionCode } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceMetadataCacheException extends CustomException {
  constructor(message: string, code: WorkspaceMetadataCacheExceptionCode) {
    super(message, code);
  }
}
