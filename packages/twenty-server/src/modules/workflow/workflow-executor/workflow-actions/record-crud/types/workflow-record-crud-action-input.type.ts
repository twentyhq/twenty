import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

type ObjectRecord = Record<string, any>;

export enum WorkflowRecordCRUDType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  FIND = 'find',
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

export type WorkflowFindRecordActionInput = {
  type: WorkflowRecordCRUDType.FIND;
  objectName: string;
  filter?: Partial<RecordFilter>;
  orderBy?: string;
  limit?: number;
};

export type WorkflowRecordCRUDActionInput =
  | WorkflowCreateRecordActionInput
  | WorkflowUpdateRecordActionInput
  | WorkflowDeleteRecordActionInput
  | WorkflowFindRecordActionInput;
