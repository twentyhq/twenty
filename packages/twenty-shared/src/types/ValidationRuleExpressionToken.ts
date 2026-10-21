export type ValidationRuleExpressionToken = {
  type:
    | 'path'
    | 'number'
    | 'string'
    | 'unclosedString'
    | 'whitespace'
    | 'symbol';
  text: string;
  start: number;
  end: number;
};
