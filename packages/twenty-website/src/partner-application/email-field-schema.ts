import { z } from 'zod';

// Shared by the server route and the client reducer so both reject the same
// values. English error strings are server-facing; the wizard maps the field's
// error code to a localized message.
export const emailFieldSchema = z
  .string()
  .trim()
  .min(1, { error: 'Email is required.' })
  .pipe(z.email({ error: 'Invalid email address.' }));
