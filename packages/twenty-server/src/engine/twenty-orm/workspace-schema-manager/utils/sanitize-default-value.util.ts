import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export const sanitizeDefaultValue = (
  defaultValue: string | number | boolean | null,
): string | number | boolean => {
  if (defaultValue === null) {
    return 'NULL';
  }

  const allowedFunctions = ['public.uuid_generate_v4()', 'now()'];

  if (typeof defaultValue === 'string') {
    if (allowedFunctions.includes(defaultValue.toLowerCase())) {
      return defaultValue;
    }

    return `'${removeSqlDDLInjection(defaultValue)}'`;
  }

  return defaultValue;
};
