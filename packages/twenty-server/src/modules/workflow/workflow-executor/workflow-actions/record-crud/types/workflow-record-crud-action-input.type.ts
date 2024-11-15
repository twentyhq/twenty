import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type ObjectRecord = Record<string, any>;

export enum WorkflowRecordCRUDType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
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

export type WorkflowReadRecordActionInput = {
  type: WorkflowRecordCRUDType.READ;
  objectName: string;
  filter?: Partial<ObjectRecordFilter>;
  orderBy?: Partial<ObjectRecordOrderBy>;
  limit?: number;
};

export type WorkflowRecordCRUDActionInput =
  | WorkflowCreateRecordActionInput
  | WorkflowUpdateRecordActionInput
  | WorkflowDeleteRecordActionInput
  | WorkflowReadRecordActionInput;
