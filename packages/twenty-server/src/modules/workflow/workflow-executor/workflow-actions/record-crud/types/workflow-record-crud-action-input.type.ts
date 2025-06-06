import {
  ObjectRecordFilter,
  ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // TODO: migrate gql computation and record filter groups to twenty-shared
  filter?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recordFilterGroups?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recordFilters?: any;
    gqlOperationFilter?: Partial<ObjectRecordFilter>[];
  };
  orderBy?: Partial<ObjectRecordOrderBy>;
  limit?: number;
};
