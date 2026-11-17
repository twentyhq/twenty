import { type ComputedColumnSqlContext } from 'src/engine/twenty-orm/computed-column/types/computed-column-sql-context.type';

export const bindComputedColumnTextParameter = ({
  context,
  text,
}: {
  context: Pick<ComputedColumnSqlContext, 'parameters'>;
  text: string;
}): string => {
  const parameterName = `computedColumnText${Object.keys(context.parameters).length}`;

  context.parameters[parameterName] = text;

  return parameterName;
};
