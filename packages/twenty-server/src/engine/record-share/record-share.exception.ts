import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum RecordShareExceptionCode {
  TRANSACTION_SCOPE_WORKSPACE_MISMATCH = 'TRANSACTION_SCOPE_WORKSPACE_MISMATCH',
}

export class RecordShareException extends CustomException<RecordShareExceptionCode> {
  constructor(message: string, code: RecordShareExceptionCode) {
    super(message, code, { userFriendlyMessage: STANDARD_ERROR_MESSAGE });
  }
}
