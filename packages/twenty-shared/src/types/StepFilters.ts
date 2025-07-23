import { ViewFilterOperand } from './ViewFilterOperand';

export enum StepLogicalOperator {
  AND = 'AND',
  OR = 'OR',
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
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  stepFilterGroupId: string;
  stepOutputKey: string;
  positionInStepFilterGroup?: number;
};
