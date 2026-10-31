import { type SharedDependenciesExportNames } from '@/front-component-build/shared-dependencies-export-names.type';

export type SharedDependenciesBuildManifest = {
  checksum: string;
  packageJsonChecksum: string;
  yarnLockChecksum: string | null;
  exports: Record<string, SharedDependenciesExportNames>;
};
