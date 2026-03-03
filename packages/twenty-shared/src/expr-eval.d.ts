declare module 'expr-eval' {
  export type Value =
    | number
    | string
    | boolean
    | null
    | undefined
    | Value[]
    | ((...args: Value[]) => Value)
    | { [propertyName: string]: Value };

  export type EvaluationContext = Record<string, unknown>;

  export interface Values {
    [propertyName: string]: Value;
  }

  export interface ParserOptions {
    allowMemberAccess?: boolean;
    operators?: {
      add?: boolean;
      comparison?: boolean;
      concatenate?: boolean;
      conditional?: boolean;
      divide?: boolean;
      factorial?: boolean;
      logical?: boolean;
      multiply?: boolean;
      power?: boolean;
      remainder?: boolean;
      subtract?: boolean;
      sin?: boolean;
      cos?: boolean;
      tan?: boolean;
      asin?: boolean;
      acos?: boolean;
      atan?: boolean;
      sinh?: boolean;
      cosh?: boolean;
      tanh?: boolean;
      asinh?: boolean;
      acosh?: boolean;
      atanh?: boolean;
      sqrt?: boolean;
      log?: boolean;
      ln?: boolean;
      lg?: boolean;
      log10?: boolean;
      abs?: boolean;
      ceil?: boolean;
      floor?: boolean;
      round?: boolean;
      trunc?: boolean;
      exp?: boolean;
      length?: boolean;
      in?: boolean;
      random?: boolean;
      min?: boolean;
      max?: boolean;
      assignment?: boolean;
      fndef?: boolean;
      cbrt?: boolean;
      expm1?: boolean;
      log1p?: boolean;
      sign?: boolean;
      log2?: boolean;
    };
  }

  export class Parser {
    constructor(options?: ParserOptions);
    unaryOps: any;
    functions: any;
    consts: any;
    parse(expression: string): Expression;
    evaluate(expression: string, values?: EvaluationContext): number;
    static parse(expression: string): Expression;
    static evaluate(expression: string, values?: EvaluationContext): number;
  }

  export interface Expression {
    simplify(values?: EvaluationContext): Expression;
    evaluate(values?: EvaluationContext): any;
    substitute(
      variable: string,
      value: Expression | string | number,
    ): Expression;
    symbols(options?: { withMembers?: boolean }): string[];
    variables(options?: { withMembers?: boolean }): string[];
    toJSFunction(
      params: string,
      values?: EvaluationContext,
    ): (...args: any[]) => number;
  }
}
