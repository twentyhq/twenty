import { type ConditionalAvailabilityValidationResult } from '@/conditional-availability/types/ConditionalAvailabilityValidationResult';
import { type ExpressionSyntaxError } from '@/types/ExpressionSyntaxError';

export type ConditionalAvailabilityParseResult =
  | ConditionalAvailabilityValidationResult
  | {
      isValid: false;
      errorCode: 'EXPRESSION_TOO_LONG';
      errorMessage: string;
      errorParams: { maxLength: number };
    }
  | ({ isValid: false } & ExpressionSyntaxError);
