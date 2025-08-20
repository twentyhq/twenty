import { CustomException } from 'src/utils/custom-exception';

export class WorkspaceCleanerException extends CustomException<WorkspaceCleanerExceptionCode> {}

export enum WorkspaceCleanerExceptionCode {
  BILLING_SUBSCRIPTION_NOT_FOUND = 'BILLING_SUBSCRIPTION_NOT_FOUND',
}
