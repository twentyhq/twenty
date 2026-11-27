import { APPLICATION_SOURCE_FILE_EXTENSIONS } from '../constants/application-source-file-extensions';

export const isRestorableApplicationSourcePath = (path: string): boolean =>
  !/[\\:\0]/.test(path) &&
  path.toLowerCase() !== 'manifest.json' &&
  path
    .split('/')
    .every(
      (segment) =>
        segment.length > 0 &&
        !segment.startsWith('.') &&
        segment.toLowerCase() !== 'node_modules',
    ) &&
  APPLICATION_SOURCE_FILE_EXTENSIONS.some((extension) =>
    path.toLowerCase().endsWith(extension),
  );
