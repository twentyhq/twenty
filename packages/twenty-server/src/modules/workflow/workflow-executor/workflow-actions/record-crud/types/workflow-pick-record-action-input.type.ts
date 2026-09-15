export type WorkflowPickRecordStrategy =
  | 'RANDOM'
  | 'ROUND_ROBIN'
  | 'LOAD_BALANCED';

export type WorkflowPickRecordLoadBalance = {
  objectNameSingular: string;
  fieldName: string;
};

export type WorkflowPickRecordActionInput = {
  objectName: string;
  strategy: WorkflowPickRecordStrategy;
  recordIds: string[];
  loadBalance?: WorkflowPickRecordLoadBalance;
};
