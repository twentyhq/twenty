export enum MessagingErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  UNKNOWN = 'UNKNOWN',
}

export interface MessagingError {
  message: string;
  code: MessagingErrorCode;
}
