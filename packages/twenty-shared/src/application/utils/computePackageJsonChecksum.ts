import { computeDependencyFileChecksum } from '@/application/utils/computeDependencyFileChecksum';

export const computePackageJsonChecksum = (
  packageJsonContent: string,
): string =>
  computeDependencyFileChecksum(JSON.stringify(JSON.parse(packageJsonContent)));
