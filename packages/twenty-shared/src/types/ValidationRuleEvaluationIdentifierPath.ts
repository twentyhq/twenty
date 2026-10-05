import { type ValidationRuleResolvedIdentifierPath } from './ValidationRuleResolvedIdentifierPath';

export type ValidationRuleEvaluationIdentifierPath = {
  segments: string[];
  resolvedPath: ValidationRuleResolvedIdentifierPath;
};
