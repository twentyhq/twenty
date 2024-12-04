import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailRefreshTokenError = (error: {
  status: number;
  reason: string;
  message: string;
}): MessageImportDriverException => {
  const { status, reason, message } = error;

  switch (status) {
    case 400:
      if (reason === 'invalid_grant') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      break;

    case 500:
      if (reason === 'backendError') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      break;

    default:
      break;
  }

  return new MessageImportDriverException(
    message,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
