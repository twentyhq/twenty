import { AggregateOperations } from '@/types/AggregateOperations';

export const ROLLUP_AGGREGATE_OPERATIONS = [
  AggregateOperations.COUNT,
  AggregateOperations.SUM,
  AggregateOperations.AVG,
  AggregateOperations.MIN,
  AggregateOperations.MAX,
] as const satisfies AggregateOperations[];
