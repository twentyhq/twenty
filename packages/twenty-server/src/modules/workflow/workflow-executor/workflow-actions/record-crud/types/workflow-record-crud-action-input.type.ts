import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';

export type WorkflowCreateRecordActionInput = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
};

export type WorkflowUpdateRecordActionInput = {
  objectName: string;
  objectRecord: ObjectRecordProperties;
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
