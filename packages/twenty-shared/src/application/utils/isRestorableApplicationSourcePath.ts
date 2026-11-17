import { APPLICATION_SOURCE_FILE_EXTENSIONS } from '../constants/application-source-file-extensions';

export const isRestorableApplicationSourcePath = (path: string): boolean =>
  !/[\\:\0]/.test(path) &&
  !['manifest.json', 'package.json', 'yarn.lock'].includes(
    path.toLowerCase(),
  ) &&
  path
    .split('/')
    .every(
      (segment) =>
        segment.length > 0 &&
        !segment.startsWith('.') &&
        !['node_modules', 'dist'].includes(segment.toLowerCase()),
    ) &&
  APPLICATION_SOURCE_FILE_EXTENSIONS.some((extension) =>
    path.toLowerCase().endsWith(extension),
  );
