import { z } from 'zod';

import { isDomain } from 'src/engine/utils/is-domain';

export const BLOCKLIST_HANDLE_SCHEMA = z
  .string()
  .trim()
  .pipe(z.email({ error: 'Invalid email or domain' }))
  .or(
    z
      .string()
      .refine(
        (value) => value.startsWith('@') && isDomain(value.slice(1)),
        'Invalid email or domain',
      ),
  );
