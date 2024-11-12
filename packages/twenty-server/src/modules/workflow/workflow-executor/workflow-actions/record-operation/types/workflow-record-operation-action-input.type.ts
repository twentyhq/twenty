type ObjectRecord = Record<string, any>;

export enum WorkflowRecordOperationType {
  CREATE = 'Create',
  UPDATE = 'Update',
  DELETE = 'Delete',
}

export type WorkflowCreateRecordActionInput = {
  type: WorkflowRecordOperationType.CREATE;
  objectName: string;
  objectRecord: ObjectRecord;
};

export type WorkflowUpdateRecordActionInput = {
  type: WorkflowRecordOperationType.UPDATE;
  objectName: string;
  objectRecord: ObjectRecord;
  objectRecordId: string;
};

export type WorkflowDeleteRecordActionInput = {
  type: WorkflowRecordOperationType.DELETE;
  objectName: string;
  objectRecordId: string;
};

export type WorkflowRecordOperationActionInput =
  | WorkflowCreateRecordActionInput
  | WorkflowUpdateRecordActionInput
  | WorkflowDeleteRecordActionInput;
