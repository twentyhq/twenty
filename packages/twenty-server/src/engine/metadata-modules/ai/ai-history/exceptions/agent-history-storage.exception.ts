import { msg } from '@lingui/core/macro';
import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

type AgentHistoryStorageExceptionCode =
  | 'INVALID_WORKSPACE'
  | 'RECORD_NOT_FOUND';
const AGENT_HISTORY_STORAGE_EXCEPTION_CATEGORY_BY_CODE = {
  INVALID_WORKSPACE: 'INTERNAL_SERVER_ERROR',
  RECORD_NOT_FOUND: 'NOT_FOUND',
} as const satisfies Record<
  AgentHistoryStorageExceptionCode,
  ExceptionCategory
>;

export class AgentHistoryStorageException extends CustomException<AgentHistoryStorageExceptionCode> {
  constructor(code: AgentHistoryStorageExceptionCode, message: string) {
    super(message, code, {
      userFriendlyMessage:
        code === 'RECORD_NOT_FOUND'
          ? msg`AI history record not found.`
          : msg`Unable to access AI history. Please try again.`,
      category: AGENT_HISTORY_STORAGE_EXCEPTION_CATEGORY_BY_CODE[code],
      shouldBeCapturedBySentry: code === 'RECORD_NOT_FOUND' ? false : undefined,
    });
  }
}
