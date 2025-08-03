import { removeSqlDDLInjection } from 'src/engine/workspace-manager/workspace-migration-runner/utils/remove-sql-injection.util';

export const sanitizeDefaultValue = (defaultValue: string): string => {
  const allowedFunctions = [
    'gen_random_uuid()',
    'uuid_generate_v4()',
    'now()',
    'current_timestamp',
    'current_date',
    'current_time',
    'localtime',
    'localtimestamp',
  ];

  if (allowedFunctions.includes(defaultValue.toLowerCase())) {
    return defaultValue;
  }

  return removeSqlDDLInjection(defaultValue);
};
