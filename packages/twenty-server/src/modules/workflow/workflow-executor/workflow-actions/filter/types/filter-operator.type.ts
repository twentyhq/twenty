export type FilterOperator = {
  eq?: any;
  ne?: any;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  like?: string;
  ilike?: string;
  in?: any[];
  is?: 'NULL' | any;
};
