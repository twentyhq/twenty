import { msg } from '@lingui/core/macro';
import { CustomException } from 'src/utils/custom-exception';

type AgentHistoryStorageExceptionCode =
  | 'INVALID_STATE'
  | 'MISSING_STATE'
  | 'INVALID_WORKSPACE'
  | 'INVALID_CRITERIA'
  | 'RECORD_NOT_FOUND';

export class AgentHistoryStorageException extends CustomException<AgentHistoryStorageExceptionCode> {
  constructor(code: AgentHistoryStorageExceptionCode, message: string) {
    super(message, code, {
      userFriendlyMessage:
        code === 'RECORD_NOT_FOUND'
          ? msg`AI history record not found.`
          : msg`Unable to access AI history. Please try again.`,
      statusCode: code === 'RECORD_NOT_FOUND' ? 404 : undefined,
    });
  }
}
