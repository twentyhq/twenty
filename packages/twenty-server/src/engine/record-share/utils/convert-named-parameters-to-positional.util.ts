import { type ObjectLiteral } from 'typeorm';

export type PositionalSqlStatement = {
  sql: string;
  values: unknown[];
};

const NAMED_PARAMETER_PATTERN = /(?<!:):(\.\.\.)?([A-Za-z0-9_]+)/g;

export const convertNamedParametersToPositional = ({
  sql,
  parameters,
}: {
  sql: string;
  parameters: ObjectLiteral;
}): PositionalSqlStatement => {
  const values: unknown[] = [];
  const placeholderByParameterName = new Map<string, string>();

  const bindValue = (value: unknown): string => {
    values.push(value);

    return `$${values.length}`;
  };

  const convertedSql = sql.replace(
    NAMED_PARAMETER_PATTERN,
    (match, spread: string | undefined, parameterName: string) => {
      if (!Object.prototype.hasOwnProperty.call(parameters, parameterName)) {
        return match;
      }

      const knownPlaceholder = placeholderByParameterName.get(parameterName);

      if (knownPlaceholder !== undefined) {
        return knownPlaceholder;
      }

      const value = parameters[parameterName];
      const placeholder =
        spread === '...' && Array.isArray(value)
          ? value.map(bindValue).join(', ')
          : bindValue(value);

      placeholderByParameterName.set(parameterName, placeholder);

      return placeholder;
    },
  );

  return { sql: convertedSql, values };
};
