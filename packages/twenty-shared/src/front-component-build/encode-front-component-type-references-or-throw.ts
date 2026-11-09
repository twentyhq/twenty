import { gzipSync } from 'node:zlib';
import { CustomError } from '../utils/errors/CustomError';
import { FRONT_COMPONENT_TYPE_REFERENCES_MAX_BYTES } from './front-component-type-references-max-bytes';

export const encodeFrontComponentTypeReferencesOrThrow = (
  files: Record<string, string>,
): Buffer => {
  const content = JSON.stringify(files);
  if (Buffer.byteLength(content) > FRONT_COMPONENT_TYPE_REFERENCES_MAX_BYTES) {
    throw new CustomError(
      'Frontend component type references exceed the 32 MiB limit. Reduce the app dependencies or generated SDK size.',
      'OUTPUT_TOO_LARGE',
    );
  }
  return gzipSync(content);
};
