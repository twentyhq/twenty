import { type ExpressionNode } from './ExpressionNode';
import { type ValidationRuleErrorCode } from './ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from './ValidationRuleErrorParams';

export type ExpressionTreeResult =
  | { isValid: true; tree: ExpressionNode }
  | {
      isValid: false;
      errorMessage: string;
      errorCode: ValidationRuleErrorCode;
      errorParams?: ValidationRuleErrorParams;
    };
