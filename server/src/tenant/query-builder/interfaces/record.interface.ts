export interface Record {
  [key: string]: any;
}

export type RecordFilter = {
  [Property in keyof Record]: any;
};

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
}

export type RecordOrderBy = {
  [Property in keyof Record]: OrderByDirection;
};
