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
  stepOutputKey: string;
  operand: ViewFilterOperand;
  value: string;
  displayValue: string;
  stepFilterGroupId: string;
  positionInStepFilterGroup?: number;
  fieldMetadataId?: string;
  compositeFieldSubFieldName?: string;
};
