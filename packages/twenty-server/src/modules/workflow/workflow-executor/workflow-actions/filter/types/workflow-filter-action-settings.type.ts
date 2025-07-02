import { BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum Operand {
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

export type FilterGroup = {
  id: string;
  logicalOperator: LogicalOperator;
  parentRecordFilterGroupId?: string;
  positionInRecordFilterGroup?: number;
};

export type Filter = {
  id: string;
  type: string;
  label: string;
  value: string;
  operand: Operand;
  displayValue: string;
  recordFilterGroupId: string;
  stepOutputKey: string;
};

export type WorkflowFilterActionSettings = BaseWorkflowActionSettings & {
  input: {
    filterGroups?: FilterGroup[];
    filters?: Filter[];
  };
};
