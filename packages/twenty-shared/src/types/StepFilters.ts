export enum StepLogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum StepOperand {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
  LIKE = 'like',
  ILIKE = 'ilike',
  IN = 'in',
  IS = 'is',
}

export type StepFilterGroup = {
  id: string;
  logicalOperator: StepLogicalOperator;
  parentStepFilterGroupId?: string;
  positionInStepFilterGroup?: number;
};

export type StepFilter = {
  id: string;
  type: string;
  label: string;
  value: string;
  operand: StepOperand;
  displayValue: string;
  stepFilterGroupId: string;
  stepOutputKey: string;
  positionInStepFilterGroup?: number;
};
