// One step of a parsed expression, in reverse Polish order
export type ExpressionInstruction = {
  type: string;
  value: unknown;
};
