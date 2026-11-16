// Binds each operand once so nested date functions stay linear in size; OFFSET 0 stops Postgres inlining them back
export const withComputedFieldBoundOperandsSql = ({
  operands,
  render,
}: {
  operands: Record<string, string>;
  render: (columns: Record<string, string>) => string;
}): string => {
  const alias = '"dateFunctionOperands"';
  const columns = Object.fromEntries(
    Object.keys(operands).map((name) => [name, `${alias}."${name}"`]),
  );
  const selectedOperands = Object.entries(operands)
    .map(([name, sql]) => `${sql} AS "${name}"`)
    .join(', ');

  return `(SELECT ${render(columns)} FROM (SELECT ${selectedOperands} OFFSET 0) AS ${alias})`;
};
