import { z } from 'zod';

// z.httpUrl enforces an http(s) scheme and a TLD-shaped hostname, so the client
// rejects bare hosts like http://localhost — matching the server route exactly.
export const httpUrlFieldSchema = z
  .string()
  .trim()
  .min(1)
  .pipe(z.httpUrl({ error: 'Invalid URL.' }));
