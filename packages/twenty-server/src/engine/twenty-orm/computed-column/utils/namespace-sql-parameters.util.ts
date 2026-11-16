import { type SqlWithParameters } from 'src/engine/twenty-orm/computed-column/types/sql-with-parameters.type';

// A subquery embedded in another statement shares its parameter names, so each gets its own prefix
export const namespaceSqlParameters = ({
  sql,
  parameters,
  namespace,
}: SqlWithParameters & { namespace: string }): SqlWithParameters => {
  const prefix = `${namespace.replace(/\W/g, '_')}_`;

  return Object.entries(parameters).reduce<SqlWithParameters>(
    (namespaced, [parameterName, value]) => ({
      sql: namespaced.sql.replace(
        new RegExp(`(?<![:\\w]):(\\.\\.\\.)?${parameterName}(?!\\w)`, 'g'),
        `:$1${prefix}${parameterName}`,
      ),
      parameters: {
        ...namespaced.parameters,
        [`${prefix}${parameterName}`]: value,
      },
    }),
    { sql, parameters: {} },
  );
};
