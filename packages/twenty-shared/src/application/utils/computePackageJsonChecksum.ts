import { computeDependencyFileChecksum } from '@/application/utils/computeDependencyFileChecksum';

// Serialized again so that formatting alone does not change the checksum
export const computePackageJsonChecksum = (
  packageJsonContent: string,
): string =>
  computeDependencyFileChecksum(JSON.stringify(JSON.parse(packageJsonContent)));
