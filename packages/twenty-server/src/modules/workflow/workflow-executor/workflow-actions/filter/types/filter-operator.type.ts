export type FilterOperator = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eq?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ne?: any;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  like?: string;
  ilike?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  in?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  is?: 'NULL' | any;
};
