import { parseJson } from 'twenty-shared/utils';
import { z } from 'zod';

const ROLE_IDS_SCHEMA = z.array(z.string());

export const parseConditionalDisplayRoleIds = (
  value: string | null | undefined,
): string[] | null => {
  const parsedRoleIds = ROLE_IDS_SCHEMA.safeParse(parseJson<unknown>(value));

  return parsedRoleIds.success ? parsedRoleIds.data : null;
};
