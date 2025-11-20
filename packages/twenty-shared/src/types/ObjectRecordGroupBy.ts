import { type ObjectRecord } from '@/types/ObjectRecord';
import { type ObjectRecordGroupByDateGranularity } from '@/types/ObjectRecordGroupByDateGranularity';

export enum OrderByDirection {
  AscNullsFirst = 'AscNullsFirst',
  AscNullsLast = 'AscNullsLast',
  DescNullsFirst = 'DescNullsFirst',
  DescNullsLast = 'DescNullsLast',
}

export type AggregateOrderByWithGroupByField = {
  aggregate: {
    [x: string]: OrderByDirection;
  };
};

export type ObjectRecordOrderByWithGroupByDateField = {
  [Property in keyof ObjectRecord]?: {
    orderBy: OrderByDirection;
    granularity: ObjectRecordGroupByDateGranularity;
  };
};

export type OrderByWithGroupBy = Array<
  | ObjectRecordOrderByForScalarField
  | ObjectRecordOrderByForCompositeField
  | ObjectRecordOrderByWithGroupByDateField
  | ObjectRecordOrderByForRelationField
  | AggregateOrderByWithGroupByField
>;

export type ObjectRecordOrderByForScalarField = {
  [Property in keyof ObjectRecord]?: OrderByDirection;
};

export type ObjectRecordOrderByForCompositeField = {
  [Property in keyof ObjectRecord]?: Record<string, OrderByDirection>;
};

export type ObjectRecordOrderByForRelationField = {
  [Property in keyof ObjectRecord]?:
    | ObjectRecordOrderByForCompositeField
    | ObjectRecordOrderByWithGroupByDateField
    | ObjectRecordOrderByForScalarField;
};
