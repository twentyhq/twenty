import { type ExpressionSyntaxErrorCode } from './ExpressionSyntaxErrorCode';

export type ExpressionSyntaxError = {
  errorMessage: string;
  errorCode: ExpressionSyntaxErrorCode;
  errorParams?: { token: string };
};
