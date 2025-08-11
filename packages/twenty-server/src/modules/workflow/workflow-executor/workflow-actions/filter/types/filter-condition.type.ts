import { type FilterOperator } from './filter-operator.type';

export type FilterCondition = {
  and?: FilterCondition[];
  or?: FilterCondition[];
  not?: FilterCondition;
  [key: string]:
    | FilterOperator
    | FilterCondition
    | FilterCondition[]
    | undefined;
};
