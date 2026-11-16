import { FRONT_COMPONENT_TYPE_REFERENCES_MAX_BYTES } from './front-component-type-references-max-bytes';
import { gunzipSync } from 'node:zlib';
import { z } from 'zod';

export const decodeFrontComponentTypeReferences = (
  content: Uint8Array,
): Record<string, string> =>
  z.record(z.string(), z.string()).parse(
    JSON.parse(
      gunzipSync(content, {
        maxOutputLength: FRONT_COMPONENT_TYPE_REFERENCES_MAX_BYTES,
      }).toString(),
    ),
  );
