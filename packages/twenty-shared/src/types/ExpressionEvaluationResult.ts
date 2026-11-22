import { type ValidationRuleErrorCode } from './ValidationRuleErrorCode';

export type ExpressionEvaluationResult =
  | { status: 'evaluated'; value: unknown }
  | {
      status: 'errored';
      errorMessage: string;
      errorCode?: ValidationRuleErrorCode;
    };
