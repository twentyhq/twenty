import { escapeLiteral } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const ALLOWED_DEFAULT_FUNCTIONS = new Set([
  'public.uuid_generate_v4()',
  'now()',
]);

export const sanitizeDefaultValue = (
  defaultValue: string | number | boolean | null,
): string | number | boolean => {
  if (defaultValue === null) {
    return 'NULL';
  }

  if (typeof defaultValue === 'string') {
    if (ALLOWED_DEFAULT_FUNCTIONS.has(defaultValue.toLowerCase())) {
      return defaultValue;
    }

    return escapeLiteral(defaultValue);
  }

  return defaultValue;
};
