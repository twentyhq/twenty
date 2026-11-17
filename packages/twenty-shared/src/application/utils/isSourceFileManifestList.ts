import { isArray, isString } from '@sniptt/guards';
import { isPlainObject } from '../../utils/typeguard/isPlainObject';
import { type SourceFileManifest } from '../sourceFileManifestType';
import { isRestorableApplicationSourcePath } from './isRestorableApplicationSourcePath';

export const isSourceFileManifestList = (
  value: unknown,
): value is SourceFileManifest[] => {
  if (!isArray(value)) {
    return false;
  }
  const paths = new Set<string>();
  return value.every((file) => {
    if (
      !isPlainObject(file) ||
      !isString(file.filePath) ||
      !isRestorableApplicationSourcePath(file.filePath) ||
      ['package.json', 'yarn.lock'].includes(file.filePath.toLowerCase()) ||
      !isString(file.checksum) ||
      !/^[a-f0-9]{32}$/.test(file.checksum) ||
      paths.has(file.filePath.toLowerCase())
    ) {
      return false;
    }
    paths.add(file.filePath.toLowerCase());
    return true;
  });
};
