import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

type ObjectRecord = Record<string, any>;

export type WorkflowCreateRecordActionInput = {
  objectName: string;
  objectRecord: ObjectRecord;
};

export type WorkflowUpdateRecordActionInput = {
  objectName: string;
  objectRecord: ObjectRecord;
  objectRecordId: string;
  fieldsToUpdate: string[];
};

export type WorkflowDeleteRecordActionInput = {
  objectName: string;
  objectRecordId: string;
};

export type WorkflowFindRecordsActionInput = {
  objectName: string;
  filter?: Partial<ObjectRecordFilter>;
  orderBy?: Partial<ObjectRecordOrderBy>;
  limit?: number;
};
