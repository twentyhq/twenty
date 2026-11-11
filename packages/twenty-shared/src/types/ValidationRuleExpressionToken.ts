export type ValidationRuleExpressionToken = {
  type:
    | 'path'
    | 'number'
    | 'string'
    | 'unclosedString'
    | 'whitespace'
    | 'symbol'
    | 'variable';
  text: string;
  start: number;
  end: number;
};
