export const VALIDATION_RULE_AGGREGATE_FUNCTIONS = {
  count: { valueOnEmptySet: 0 },
} as const satisfies Record<string, { valueOnEmptySet: number | null }>;
