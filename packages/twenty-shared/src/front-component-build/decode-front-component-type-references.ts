import { gunzipSync } from 'node:zlib';
import { z } from 'zod';

export const decodeFrontComponentTypeReferences = (
  content: Uint8Array,
): Record<string, string> =>
  z
    .record(z.string(), z.string())
    .parse(
      JSON.parse(
        gunzipSync(content, { maxOutputLength: 32 * 1024 * 1024 }).toString(),
      ),
    );
