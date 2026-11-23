import { type ROLLUP_AGGREGATE_OPERATIONS } from '@/constants/RollupAggregateOperations';

export type RollupAggregateOperation =
  (typeof ROLLUP_AGGREGATE_OPERATIONS)[number];
