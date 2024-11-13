type ObjectRecord = Record<string, any>;

export enum WorkflowRecordCRUDType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
}

export type WorkflowCreateRecordActionInput = {
  type: WorkflowRecordCRUDType.CREATE;
  objectName: string;
  objectRecord: ObjectRecord;
};

export type WorkflowUpdateRecordActionInput = {
  type: WorkflowRecordCRUDType.UPDATE;
  objectName: string;
  objectRecord: ObjectRecord;
  objectRecordId: string;
};

export type WorkflowDeleteRecordActionInput = {
  type: WorkflowRecordCRUDType.DELETE;
  objectName: string;
  objectRecordId: string;
};

export type WorkflowRecordCRUDActionInput =
  | WorkflowCreateRecordActionInput
  | WorkflowUpdateRecordActionInput
  | WorkflowDeleteRecordActionInput;
