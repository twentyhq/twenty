import { type ValidationRuleErrorCode } from './ValidationRuleErrorCode';

export type ValidationRuleEvaluationResult =
  | { status: 'passed' }
  | { status: 'failed' }
  | {
      status: 'errored';
      errorMessage: string;
      errorCode?: ValidationRuleErrorCode;
    };
