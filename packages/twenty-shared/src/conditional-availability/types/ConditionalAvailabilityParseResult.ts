import { type ConditionalAvailabilityCheckResult } from './ConditionalAvailabilityCheckResult';
import { type ExpressionSyntaxError } from './ExpressionSyntaxError';

export type ConditionalAvailabilityParseResult =
  | ConditionalAvailabilityCheckResult
  | {
      isValid: false;
      errorCode: 'EXPRESSION_TOO_LONG';
      errorMessage: string;
      errorParams: { maxLength: number };
    }
  | ({ isValid: false } & ExpressionSyntaxError);
