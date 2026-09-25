import { type ValidationRuleAggregateFunctionName } from './ValidationRuleAggregateFunctionName';

export type ValidationRuleAggregateValues = Partial<
  Record<ValidationRuleAggregateFunctionName, number | null>
>;
