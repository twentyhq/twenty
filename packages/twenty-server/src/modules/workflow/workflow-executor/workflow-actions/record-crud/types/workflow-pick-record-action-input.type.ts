export type WorkflowPickRecordStrategy = 'RANDOM' | 'ROUND_ROBIN';

export type WorkflowPickRecordActionInput = {
  objectName: string;
  strategy: WorkflowPickRecordStrategy;
  recordIds: string[];
};
