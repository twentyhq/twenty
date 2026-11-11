// The loosest operator at the top of the source decides where parentheses are needed
export type RuleExpressionNode = {
  source: string;
  precedence: 'operand' | 'comparison' | 'and' | 'or';
};
