import { type ViewFilterOperand } from './ViewFilterOperand';

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
  stepOutputKey: string;
  operand: ViewFilterOperand;
  value: string;
  stepFilterGroupId: string;
  positionInStepFilterGroup?: number;
  fieldMetadataId?: string;
  compositeFieldSubFieldName?: string;
  isFullRecord?: boolean;
};
