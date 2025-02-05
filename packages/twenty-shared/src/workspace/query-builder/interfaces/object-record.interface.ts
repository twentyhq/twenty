export interface ObjectRecord {
  id: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type ObjectRecordFilter = {
  [Property in keyof ObjectRecord]: any;
};

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
}

export type ObjectRecordOrderBy = Array<{
  [Property in keyof ObjectRecord]?:
    | OrderByDirection
    | Record<string, OrderByDirection>;
}>;

export interface ObjectRecordDuplicateCriteria {
  objectName: string;
  columnNames: string[];
}
