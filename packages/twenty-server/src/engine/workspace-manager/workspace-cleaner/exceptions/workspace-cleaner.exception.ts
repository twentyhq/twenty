import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceCleanerException extends CustomException {
  constructor(message: string, code: WorkspaceCleanerExceptionCode) {
    super(message, code);
  }
}

export enum WorkspaceCleanerExceptionCode {
  BILLING_SUBSCRIPTION_NOT_FOUND = 'BILLING_SUBSCRIPTION_NOT_FOUND',
}
