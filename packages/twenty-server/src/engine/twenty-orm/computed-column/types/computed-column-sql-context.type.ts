// One per statement, shared with the subqueries it embeds: every parameter its computed columns bind
export type ComputedColumnSqlContext = {
  parameters: Record<string, unknown>;
};
