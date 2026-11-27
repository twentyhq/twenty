import { type ConditionalEvaluationValidationResult } from '@/conditional-evaluation/validate/types/ConditionalEvaluationValidationResult';
import { type ExpressionSyntaxError } from '@/types/ExpressionSyntaxError';

export type ConditionalEvaluationParseResult =
  | ConditionalEvaluationValidationResult
  | {
      isValid: false;
      errorCode: 'EXPRESSION_TOO_LONG';
      errorMessage: string;
      errorParams: { maxLength: number };
    }
  | ({ isValid: false } & ExpressionSyntaxError);
