export type WorkflowPickRecordStrategy = 'RANDOM';

export type WorkflowPickRecordActionInput = {
  objectName: string;
  strategy: WorkflowPickRecordStrategy;
  recordIds: string[];
};
